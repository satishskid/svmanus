import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Volume2, Ear, ArrowLeft, Check, X } from "lucide-react";
import { Link } from "wouter";

type ScreeningStep = "intro" | "calibration" | "pure-tone" | "speech-in-noise" | "results";

interface AudiometryResult {
  frequency: number;
  threshold: number;
  ear: "left" | "right";
}

export default function HearingScreening() {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<ScreeningStep>("intro");
  const [ageGroup, setAgeGroup] = useState<string>("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Pure tone audiometry state
  const [currentEar, setCurrentEar] = useState<"left" | "right">("left");
  const [currentFrequencyIndex, setCurrentFrequencyIndex] = useState(0);
  const [currentVolume, setCurrentVolume] = useState(30);
  const [pureToneResults, setPureToneResults] = useState<AudiometryResult[]>([]);
  const [toneActive, setToneActive] = useState(false);

  // Speech-in-noise state
  const [speechTestResponses, setSpeechTestResponses] = useState<boolean[]>([]);
  const [currentSpeechIndex, setCurrentSpeechIndex] = useState(0);

  // Calibration state
  const [calibrationLevel, setCalibrationLevel] = useState(50);
  const [isCalibrated, setIsCalibrated] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">Please log in to access hearing screening.</p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const frequencies = [250, 500, 1000, 2000, 4000, 8000];

  // Initialize audio context
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      gainNodeRef.current = audioContext.createGain();
      gainNodeRef.current.connect(audioContext.destination);
    }
  };

  // Play tone at specific frequency
  const playTone = (frequency: number, duration: number = 1000) => {
    initAudioContext();
    const audioContext = audioContextRef.current;
    const gainNode = gainNodeRef.current;

    if (!audioContext || !gainNode) return;

    // Stop any existing tone
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
    }

    const oscillator = audioContext.createOscillator();
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    oscillator.connect(gainNode);

    // Set volume (0-100 scale to 0-0.3 gain)
    gainNode.gain.setValueAtTime((currentVolume / 100) * 0.3, audioContext.currentTime);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);

    oscillatorRef.current = oscillator;
    setToneActive(true);

    setTimeout(() => {
      setToneActive(false);
    }, duration);
  };

  const handleToneResponse = (heard: boolean) => {
    if (heard) {
      // User heard the tone, record threshold and move to next frequency
      setPureToneResults((prev) => [
        ...prev,
        {
          frequency: frequencies[currentFrequencyIndex],
          threshold: currentVolume,
          ear: currentEar,
        },
      ]);

      if (currentFrequencyIndex < frequencies.length - 1) {
        setCurrentFrequencyIndex(currentFrequencyIndex + 1);
        setCurrentVolume(30); // Reset volume for next frequency
      } else {
        // Completed one ear, move to other
        if (currentEar === "left") {
          setCurrentEar("right");
          setCurrentFrequencyIndex(0);
          setCurrentVolume(30);
        } else {
          setStep("speech-in-noise");
        }
      }
    } else {
      // User didn't hear, increase volume
      if (currentVolume < 100) {
        setCurrentVolume(currentVolume + 5);
      } else {
        // Reached max volume without hearing, record and move on
        setPureToneResults((prev) => [
          ...prev,
          {
            frequency: frequencies[currentFrequencyIndex],
            threshold: 100,
            ear: currentEar,
          },
        ]);

        if (currentFrequencyIndex < frequencies.length - 1) {
          setCurrentFrequencyIndex(currentFrequencyIndex + 1);
          setCurrentVolume(30);
        } else {
          if (currentEar === "left") {
            setCurrentEar("right");
            setCurrentFrequencyIndex(0);
            setCurrentVolume(30);
          } else {
            setStep("speech-in-noise");
          }
        }
      }
    }
  };

  // Sample speech-in-noise test words
  const speechWords = [
    "Baseball",
    "Sunshine",
    "Rainbow",
    "Butterfly",
    "Mountain",
    "Butterfly",
    "Sunshine",
    "Rainbow",
  ];

  const handleSpeechResponse = (understood: boolean) => {
    const newResponses = [...speechTestResponses, understood];
    setSpeechTestResponses(newResponses);

    if (currentSpeechIndex < speechWords.length - 1) {
      setCurrentSpeechIndex(currentSpeechIndex + 1);
    } else {
      setStep("results");
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
            <h1 className="text-2xl font-bold text-primary">Hearing Screening</h1>
            <p className="text-sm text-foreground/60">Preliminary assessment only</p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {step === "intro" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Hearing Screening Setup</CardTitle>
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
                  <li>• <strong>Calibration:</strong> We'll adjust audio levels to your comfortable listening level</li>
                  <li>• <strong>Pure Tone Audiometry:</strong> You'll hear tones at different frequencies and volumes</li>
                  <li>• <strong>Speech-in-Noise:</strong> You'll identify words in background noise</li>
                  <li>• <strong>Duration:</strong> About 8-12 minutes total</li>
                  <li>• <strong>Quiet Environment:</strong> Find a quiet space for best results</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">Audio Equipment</h3>
                <p className="text-sm text-amber-800">
                  Use headphones or earbuds for accurate results. Ensure volume is at a comfortable level before starting.
                </p>
              </div>

              <Button
                onClick={() => setStep("calibration")}
                disabled={!ageGroup}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                Begin Hearing Screening
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "calibration" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Audio Calibration</CardTitle>
              <CardDescription>
                Adjust the volume to a comfortable listening level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  A test tone will play. Adjust the volume slider until it's at a comfortable listening level—not too quiet, not too loud.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-20">Volume:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={calibrationLevel}
                    onChange={(e) => setCalibrationLevel(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">{calibrationLevel}%</span>
                </div>

                <Button
                  onClick={() => {
                    setCurrentVolume(calibrationLevel);
                    playTone(1000, 1000);
                  }}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                  disabled={toneActive}
                >
                  <Volume2 className="mr-2 h-5 w-5" />
                  {toneActive ? "Playing Test Tone..." : "Play Test Tone"}
                </Button>
              </div>

              <Button
                onClick={() => {
                  setIsCalibrated(true);
                  setStep("pure-tone");
                }}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Calibration Complete
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "pure-tone" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Pure Tone Audiometry - {currentEar.charAt(0).toUpperCase() + currentEar.slice(1)} Ear</CardTitle>
              <CardDescription>
                Frequency: {frequencies[currentFrequencyIndex]} Hz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white border border-border rounded-lg p-8 text-center">
                <Ear className="h-16 w-16 mx-auto mb-4 text-primary" />
                <p className="text-lg font-semibold mb-2">
                  Listen carefully...
                </p>
                <p className="text-sm text-foreground/60 mb-6">
                  Volume: {currentVolume}%
                </p>

                <Button
                  onClick={() => playTone(frequencies[currentFrequencyIndex], 1500)}
                  className="w-full bg-primary hover:bg-primary/90 mb-4"
                  size="lg"
                  disabled={toneActive}
                >
                  <Volume2 className="mr-2 h-5 w-5" />
                  {toneActive ? "Playing Tone..." : "Play Tone"}
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleToneResponse(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="lg"
                  disabled={toneActive}
                >
                  <Check className="mr-2 h-5 w-5" />
                  I Heard It
                </Button>
                <Button
                  onClick={() => handleToneResponse(false)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  size="lg"
                  disabled={toneActive}
                >
                  <X className="mr-2 h-5 w-5" />
                  Didn't Hear It
                </Button>
              </div>

              <div className="text-sm text-foreground/60">
                <p>Frequency {currentFrequencyIndex + 1} of {frequencies.length}</p>
                <p>{currentEar.charAt(0).toUpperCase() + currentEar.slice(1)} ear</p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "speech-in-noise" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Speech-in-Noise Test</CardTitle>
              <CardDescription>
                Can you understand the word spoken in background noise?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentSpeechIndex < speechWords.length ? (
                <>
                  <div className="bg-white border border-border rounded-lg p-8 text-center">
                    <Volume2 className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <p className="text-lg font-semibold mb-4">
                      Listen to the word...
                    </p>
                    <Button
                      onClick={() => {
                        // Simulate speech-in-noise audio playback
                        playTone(800, 2000);
                      }}
                      className="w-full bg-primary hover:bg-primary/90 mb-6"
                      size="lg"
                      disabled={toneActive}
                    >
                      <Volume2 className="mr-2 h-5 w-5" />
                      {toneActive ? "Playing..." : "Play Word"}
                    </Button>
                    <p className="text-sm text-foreground/60">
                      Word {currentSpeechIndex + 1} of {speechWords.length}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">What word did you hear?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {speechWords.slice(0, 4).map((word, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          onClick={() => {
                            handleSpeechResponse(word === speechWords[currentSpeechIndex]);
                          }}
                          className="h-auto py-3"
                        >
                          {word}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-lg font-semibold mb-4">
                    Excellent! You've completed the hearing screening.
                  </p>
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
                <CardTitle>Hearing Screening Results</CardTitle>
                <CardDescription>
                  Preliminary assessment - not a medical diagnosis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="pure-tone" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pure-tone">Pure Tone</TabsTrigger>
                    <TabsTrigger value="speech">Speech-in-Noise</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pure-tone" className="space-y-4">
                    {["left", "right"].map((ear) => (
                      <div key={ear} className="border border-border rounded-lg p-4">
                        <h3 className="font-semibold mb-3 capitalize">{ear} Ear</h3>
                        <div className="space-y-2 text-sm">
                          {pureToneResults
                            .filter((r) => r.ear === ear)
                            .map((result, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="text-foreground/70">{result.frequency} Hz:</span>
                                <span className={`font-medium ${
                                  result.threshold <= 25 ? "text-green-600" : 
                                  result.threshold <= 40 ? "text-yellow-600" : 
                                  "text-red-600"
                                }`}>
                                  {result.threshold} dB
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="speech" className="space-y-4">
                    <div className="border border-border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Speech-in-Noise Performance</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-foreground/70">Words Understood:</span>
                          <span className="font-medium">
                            {speechTestResponses.filter(Boolean).length} of {speechTestResponses.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/70">Accuracy:</span>
                          <span className="font-medium">
                            {speechTestResponses.length > 0 
                              ? Math.round((speechTestResponses.filter(Boolean).length / speechTestResponses.length) * 100)
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    These results are preliminary and for screening purposes only. 
                    If any findings are concerning, please schedule a comprehensive hearing evaluation with an audiologist.
                  </p>
                  <p className="text-sm text-blue-800">
                    A professional can provide a complete diagnosis and recommend appropriate treatment or hearing aids if needed.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Link href="/" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                  Complete Screening
                </Button>
              </Link>
              <Link href="/vision-screening" className="flex-1">
                <Button variant="outline" size="lg" className="w-full">
                  Redo Vision Screening
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

