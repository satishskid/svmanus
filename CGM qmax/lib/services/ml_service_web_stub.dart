// Web stub for ML services
class MLService {
  static Future<String?> estimateHeightFromPhoto(String imagePath) async {
    return 'Web: Height estimation not available';
  }

  static Future<String?> estimateWeightFromPhoto(String imagePath) async {
    return 'Web: Weight estimation not available';
  }

  static Future<bool> isAvailable() async {
    return false;
  }
}

class MuacMLService {
  static Future<double?> estimateMUACFromPhoto(String imagePath) async {
    return null; // Web: MUAC estimation not available
  }

  static Future<bool> isAvailable() async {
    return false;
  }
}