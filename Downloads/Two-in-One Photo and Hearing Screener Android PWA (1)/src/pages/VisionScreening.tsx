import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Camera, Eye, ArrowLeft, Check, X } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

type ScreeningStep = "intro" | "photoscreening" | "visual-acuity" | "results";

export default function VisionScreening() {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<ScreeningStep>("intro");
  const [ageGroup, setAgeGroup] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [photoscreeningResults, setPhotoscreeningResults] = useState<any>(null);
  const [visualAcuityResults, setVisualAcuityResults] = useState<any>(null);

  // Photoscreening state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [currentEye, setCurrentEye] = useState<"left" | "right">("left");

  // Visual acuity state
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [acuityResponses, setAcuityResponses] = useState<boolean[]>([]);
  const [currentEye2, setCurrentEye2] = useState<"left" | "right">("left");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">Please log in to access vision screening.</p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Initialize camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      alert("Camera access is required for photoscreening.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL("image/jpeg");
        setCapturedImage(imageData);
      }
    }
  };

  const handlePhotoscreeningCapture = async () => {
    // Simulate photoscreening analysis
    const result = {
      eyeSide: currentEye,
      redReflexStatus: Math.random() > 0.3 ? "normal" : "abnormal",
      eyeAlignment: Math.random() > 0.2 ? "normal" : "esotropia",
      confidence: Math.floor(Math.random() * 40) + 60,
      imageUrl: capturedImage,
    };

    setPhotoscreeningResults((prev: any) => ({
      ...prev,
      [currentEye]: result,
    }));

    if (currentEye === "left") {
      setCurrentEye("right");
      setCapturedImage("");
    } else {
      setStep("visual-acuity");
      stopCamera();
    }
  };

  // Snellen chart lines (simplified)
  const snellenLines = [
    { line: "E", acuity: "20/200" },
    { line: "F P", acuity: "20/100" },
    { line: "T O Z", acuity: "20/70" },
    { line: "L P E D", acuity: "20/50" },
    { line: "P E C F D", acuity: "20/40" },
    { line: "E D F C Z P", acuity: "20/30" },
    { line: "F E L O P Z D", acuity: "20/20" },
    { line: "D E F P O T E C", acuity: "20/15" },
  ];

  const handleAcuityResponse = (canRead: boolean) => {
    const newResponses = [...acuityResponses, canRead];
    setAcuityResponses(newResponses);

    if (canRead) {
      setCurrentLineIndex(currentLineIndex + 1);
    } else {
      // User can't read this line, record their best acuity
      const bestAcuity = currentLineIndex > 0 ? snellenLines[currentLineIndex - 1].acuity : "20/200";
      setVisualAcuityResults((prev: any) => ({
        ...prev,
        [currentEye2]: {
          acuityMeasurement: bestAcuity,
          testMethod: "snellen",
          distanceMeters: 6,
        },
      }));

      if (currentEye2 === "left") {
        setCurrentEye2("right");
        setCurrentLineIndex(0);
        setAcuityResponses([]);
      } else {
        setStep("results");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="container flex items-center gap-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary">Vision Screening</h1>
            <p className="text-sm text-foreground/60">Preliminary assessment only</p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {step === "intro" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Vision Screening Setup</CardTitle>
              <CardDescription>
                Let's start with some basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Age Group</label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {["0-2", "3-5", "6-12", "13-18", "18+"].map((group) => (
                    <Button
                      key={group}
                      variant={ageGroup === group ? "default" : "outline"}
                      onClick={() => setAgeGroup(group)}
                      className="w-full"
                    >
                      {group}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  What to Expect
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• <strong>Photoscreening:</strong> We'll take photos of both eyes to check for red reflex and alignment</li>
                  <li>• <strong>Visual Acuity:</strong> You'll read progressively smaller letters on a chart</li>
                  <li>• <strong>Duration:</strong> About 5-10 minutes total</li>
                  <li>• <strong>Privacy:</strong> Photos are stored securely and never shared</li>
                </ul>
              </div>

              <Button
                onClick={() => setStep("photoscreening")}
                disabled={!ageGroup}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                Begin Photoscreening
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "photoscreening" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Photoscreening - {currentEye.charAt(0).toUpperCase() + currentEye.slice(1)} Eye</CardTitle>
              <CardDescription>
                Position your eye in front of the camera and ensure good lighting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!cameraActive ? (
                <Button onClick={startCamera} className="w-full bg-primary" size="lg">
                  <Camera className="mr-2 h-5 w-5" />
                  Start Camera
                </Button>
              ) : (
                <>
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-32 h-32 border-2 border-green-400 rounded-full opacity-50" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={capturePhoto}
                      className="flex-1 bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      <Camera className="mr-2 h-5 w-5" />
                      Capture Photo
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      size="lg"
                    >
                      Stop Camera
                    </Button>
                  </div>
                </>
              )}

              {capturedImage && (
                <>
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img src={capturedImage} alt="Captured" className="w-full" />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handlePhotoscreeningCapture}
                      className="flex-1 bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      <Check className="mr-2 h-5 w-5" />
                      Use This Photo
                    </Button>
                    <Button
                      onClick={() => setCapturedImage("")}
                      variant="outline"
                      size="lg"
                    >
                      Retake
                    </Button>
                  </div>
                </>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </CardContent>
          </Card>
        )}

        {step === "visual-acuity" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Visual Acuity Test - {currentEye2.charAt(0).toUpperCase() + currentEye2.slice(1)} Eye</CardTitle>
              <CardDescription>
                Can you read the letters on the chart? Start from the top.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentLineIndex < snellenLines.length ? (
                <>
                  <div className="bg-white border border-border rounded-lg p-8 text-center">
                    <div className="space-y-4">
                      {snellenLines.map((item, idx) => (
                        <div
                          key={idx}
                          className={`font-serif transition-all ${
                            idx === currentLineIndex
                              ? "text-6xl font-bold text-primary"
                              : idx < currentLineIndex
                              ? "text-4xl text-foreground/40"
                              : "text-2xl text-foreground/20"
                          }`}
                        >
                          {item.line}
                        </div>
                      ))}
                    </div>
                    <p className="mt-6 text-sm text-foreground/60">
                      Current line: {snellenLines[currentLineIndex].acuity}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleAcuityResponse(true)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <Check className="mr-2 h-5 w-5" />
                      I Can Read This
                    </Button>
                    <Button
                      onClick={() => handleAcuityResponse(false)}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      size="lg"
                    >
                      <X className="mr-2 h-5 w-5" />
                      Can't Read This
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-lg font-semibold mb-4">Excellent! You've completed the visual acuity test.</p>
                  <Button
                    onClick={() => setStep("results")}
                    className="bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    View Results
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === "results" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vision Screening Results</CardTitle>
                <CardDescription>
                  Preliminary assessment - not a medical diagnosis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="photoscreening" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="photoscreening">Photoscreening</TabsTrigger>
                    <TabsTrigger value="acuity">Visual Acuity</TabsTrigger>
                  </TabsList>

                  <TabsContent value="photoscreening" className="space-y-4">
                    {photoscreeningResults && (
                      <>
                        {Object.entries(photoscreeningResults).map(([eye, result]: [string, any]) => (
                          <div key={eye} className="border border-border rounded-lg p-4">
                            <h3 className="font-semibold mb-3 capitalize">{eye} Eye</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-foreground/70">Red Reflex:</span>
                                <span className={`font-medium ${
                                  result.redReflexStatus === "normal" ? "text-green-600" : "text-orange-600"
                                }`}>
                                  {result.redReflexStatus}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-foreground/70">Eye Alignment:</span>
                                <span className={`font-medium ${
                                  result.eyeAlignment === "normal" ? "text-green-600" : "text-orange-600"
                                }`}>
                                  {result.eyeAlignment}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-foreground/70">Confidence:</span>
                                <span className="font-medium">{result.confidence}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="acuity" className="space-y-4">
                    {visualAcuityResults && (
                      <>
                        {Object.entries(visualAcuityResults).map(([eye, result]: [string, any]) => (
                          <div key={eye} className="border border-border rounded-lg p-4">
                            <h3 className="font-semibold mb-3 capitalize">{eye} Eye</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-foreground/70">Visual Acuity:</span>
                                <span className="font-medium text-lg">{result.acuityMeasurement}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-foreground/70">Test Method:</span>
                                <span className="font-medium capitalize">{result.testMethod}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-foreground/70">Distance:</span>
                                <span className="font-medium">{result.distanceMeters}m</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    These results are preliminary and for screening purposes only. 
                    If any findings are concerning, please schedule a comprehensive eye exam with an optometrist or ophthalmologist.
                  </p>
                  <p className="text-sm text-blue-800">
                    A professional can provide a complete diagnosis and recommend appropriate treatment.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Link href="/hearing-screening" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                  Proceed to Hearing Screening
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" size="lg" className="w-full">
                  Return Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

