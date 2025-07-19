import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  Image, 
  StyleSheet, 
  StatusBar,
  ActivityIndicator,
  Animated,
  Dimensions,
  SafeAreaView
} from "react-native";
import * as ExpoCamera from "expo-camera";
import * as ImagePicker from "expo-image-picker";

const { width, height } = Dimensions.get('window');

// Professional icon components
const GalleryIcon = ({ size = 20, color = "#fff" }) => (
  <View style={[styles.iconWrapper, { width: size, height: size }]}>
    <View style={[styles.galleryIconOuter, { borderColor: color, width: size * 0.9, height: size * 0.7 }]}>
      <View style={[styles.galleryIconInner, { backgroundColor: color, width: size * 0.3, height: size * 0.3 }]} />
    </View>
    <View style={[styles.galleryIconCorner, { borderColor: color, width: size * 0.4, height: size * 0.4 }]} />
  </View>
);

const InfoIcon = ({ size = 20, color = "#fff" }) => (
  <View style={[styles.infoIconCircle, { 
    width: size, 
    height: size, 
    borderRadius: size / 2, 
    borderColor: color,
    borderWidth: 2
  }]}>
    <Text style={[styles.infoIconText, { 
      fontSize: size * 0.6, 
      color: color,
      lineHeight: size * 0.6
    }]}>i</Text>
  </View>
);

export default function App() {
  console.log("ExpoCamera:", ExpoCamera);
  console.log("Available components:", Object.keys(ExpoCamera));

  const cameraRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasLibraryPermission, setHasLibraryPermission] = useState(false);
  const [permissionsChecked, setPermissionsChecked] = useState(false);
  const [capturedUri, setCapturedUri] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Determine which camera component to use
  const CameraComponent = ExpoCamera.CameraView || ExpoCamera.Camera || ExpoCamera.default;

  useEffect(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    (async () => {
      try {
        // Use the Camera object for permissions
        const camPerm = await ExpoCamera.Camera.requestCameraPermissionsAsync();
        console.log("Camera permission response:", camPerm);
        
        const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log("Library permission response:", libPerm);
        
        setHasCameraPermission(camPerm.status === "granted");
        setHasLibraryPermission(libPerm.status === "granted");
      } catch (e) {
        console.error("Permission error:", e);
        Alert.alert(
          "Permission Error",
          e.message ||
            "Could not request permissions. Are you running on a real device/emulator?",
          [{ text: "OK", style: "default" }]
        );
      } finally {
        setPermissionsChecked(true);
      }
    })();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const camPerm = await ExpoCamera.Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(camPerm.status === "granted");
    } catch (e) {
      Alert.alert("Error", "Could not request camera permission", [{ text: "OK", style: "default" }]);
    }
  };

  const requestLibraryPermission = async () => {
    try {
      const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasLibraryPermission(libPerm.status === "granted");
    } catch (e) {
      Alert.alert("Error", "Could not request library permission", [{ text: "OK", style: "default" }]);
    }
  };

  const showProcessingAlert = () => {
    return Alert.alert(
      "Processing...",
      "Analyzing image with OCR. Please wait...",
      [],
      { cancelable: false }
    );
  };

  const dismissProcessingAlert = () => {
    // This will be handled by the new alert that replaces it
  };

  if (!permissionsChecked) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <Animated.View style={[styles.loadingContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <ActivityIndicator size="large" color="#4facfe" />
          <Text style={styles.loadingTitle}>Setting Up Camera</Text>
          <Text style={styles.loadingSubtitle}>
            Requesting permissions...
          </Text>
          <Text style={styles.warningText}>
            If this takes too long, make sure you are running on a real device or emulator, not in a web browser.
          </Text>
        </Animated.View>
      </SafeAreaView>
    );
  }
  
  if (!hasCameraPermission) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <Animated.View style={[styles.permissionContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconContainer}>
            <Text style={styles.permissionIcon}>📷</Text>
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionDescription}>
            We need camera access to capture images for OCR processing
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestCameraPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Grant Camera Permission</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }
  
  if (!hasLibraryPermission) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <Animated.View style={[styles.permissionContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconContainer}>
            <Text style={styles.permissionIcon}>🖼️</Text>
          </View>
          <Text style={styles.permissionTitle}>Photo Library Access Required</Text>
          <Text style={styles.permissionDescription}>
            We need photo library access to select images for OCR processing
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestLibraryPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Grant Library Permission</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Check if we have a valid camera component
  if (!CameraComponent) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <View style={styles.errorContent}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Camera Unavailable</Text>
          <Text style={styles.errorDescription}>
            Camera component not available. Expo Camera version might be incompatible.
          </Text>
          <Text style={styles.debugText}>
            Available: {Object.keys(ExpoCamera).join(", ")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const takePhoto = async () => {
    try {
      if (!cameraRef.current) {
        Alert.alert("Error", "Camera not ready", [{ text: "OK", style: "default" }]);
        return;
      }
      
      console.log("Taking photo...");
      setIsProcessing(true);
      showProcessingAlert();
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      console.log("Photo taken:", photo.uri);
      setCapturedUri(photo.uri);
      await sendToOCR(photo.uri);
    } catch (e) {
      console.error("Error taking photo:", e);
      setIsProcessing(false);
      Alert.alert("Error", `Failed to take photo: ${e.message}`, [{ text: "OK", style: "default" }]);
    }
  };

  const pickImage = async () => {
    try {
      console.log("Opening image picker...");
      setIsProcessing(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      console.log("Image picker result:", result);
      
      // Handle both old and new API formats
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setCapturedUri(imageUri);
        showProcessingAlert();
        await sendToOCR(imageUri);
      } else if (!result.cancelled && result.uri) {
        // Fallback for older API
        setCapturedUri(result.uri);
        showProcessingAlert();
        await sendToOCR(result.uri);
      } else {
        setIsProcessing(false);
      }
    } catch (e) {
      console.error("Error picking image:", e);
      setIsProcessing(false);
      Alert.alert("Error", `Failed to pick image: ${e.message}`, [{ text: "OK", style: "default" }]);
    }
  };

  const sendToOCR = async (uri) => {
    try {
      console.log("Preparing to send to OCR:", uri);
      
      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        name: "image.jpg",
        type: "image/jpeg",
      });
      
      console.log("Sending to OCR service...");
      
      const response = await fetch(
        "https://rivo.publicvm.com/webhook/app-hook",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log("OCR response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const json = await response.json();
      console.log("OCR result:", json);
      
      const text = json.text || json.result || "No text found";
      
      setIsProcessing(false);
      Alert.alert(
        "OCR Result", 
        text, 
        [
          {
            text: "Copy Text",
            onPress: () => {
              // You can implement clipboard functionality here
              console.log("Text copied:", text);
            },
            style: "default"
          },
          {
            text: "OK",
            style: "default"
          }
        ]
      );
    } catch (e) {
      console.error("OCR Error:", e);
      setIsProcessing(false);
      Alert.alert(
        "Processing Failed", 
        `Failed to process image: ${e.message}`,
        [{ text: "Try Again", style: "default" }]
      );
    }
  };

  // Get camera props based on the component type
  const getCameraProps = () => {
    const baseProps = {
      ref: cameraRef,
      style: styles.preview,
    };

    // For newer CameraView component
    if (ExpoCamera.CameraView) {
      return {
        ...baseProps,
        facing: "back",
      };
    }

    // For older Camera component
    if (ExpoCamera.Camera) {
      return {
        ...baseProps,
        type: ExpoCamera.Camera.Constants?.Type?.back || "back",
      };
    }

    return baseProps;
  };

  // Render the main camera interface
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerTitle}>Rivo</Text>
        <Text style={[styles.headerSubtitle, { paddingBottom: 16 }]}>
          Capture or select an image to extract text
        </Text>
      </SafeAreaView>

      {/* Camera Preview */}
      <View style={styles.previewContainer}>
        <CameraComponent {...getCameraProps()} />
        
        {/* Scan Overlay */}
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.scanInstruction}>
            Position text within the frame
          </Text>
        </View>
      </View>
      
      {/* Thumbnail */}
      {capturedUri && (
        <Animated.View style={[styles.thumbnailContainer, { opacity: fadeAnim }]}>
          <Image source={{ uri: capturedUri }} style={styles.thumbnail} />
          <View style={styles.thumbnailBadge}>
            <Text style={styles.thumbnailBadgeText}>✓</Text>
          </View>
        </Animated.View>
      )}
      
      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, styles.galleryButton]}
          onPress={pickImage}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          <GalleryIcon size={24} color="#4facfe" />
          <Text style={styles.controlButtonText}>Gallery</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
          onPress={takePhoto}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <View style={styles.captureInner} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, styles.infoButton]}
          onPress={() => {
            Alert.alert(
              "How to Use",
              "1. Point camera at text or select image from gallery\n2. Tap capture button\n3. Wait for OCR processing\n4. View extracted text",
              [{ text: "Got it", style: "default" }]
            );
          }}
          activeOpacity={0.8}
        >
          <InfoIcon size={24} color="#fff" />
          <Text style={styles.controlButtonText}>Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000" 
  },
  
  // Professional Icon Styles
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  galleryIconOuter: {
    borderWidth: 2,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryIconInner: {
    borderRadius: 1,
  },
  galleryIconCorner: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderWidth: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(79,172,254,0.2)',
  },
  infoIconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Loading Screen
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  loadingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: "#a0a0a0",
    textAlign: "center",
  },
  warningText: {
    fontSize: 14,
    color: "#ff6b6b",
    textAlign: "center",
    marginTop: 20,
    lineHeight: 20,
  },
  
  // Permission Screens
  permissionContainer: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  permissionContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  iconContainer: {
    marginBottom: 30,
  },
  permissionIcon: {
    fontSize: 80,
    textAlign: "center",
  },
  permissionTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  permissionDescription: {
    fontSize: 16,
    color: "#a0a0a0",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    backgroundColor: "#4facfe",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#4facfe",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  
  // Error Screen
  errorContainer: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  errorContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 12,
  },
  errorDescription: {
    fontSize: 16,
    color: "#a0a0a0",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  debugText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    backgroundColor: "#2d2d44",
    padding: 10,
    borderRadius: 8,
  },
  
  // Main Camera Interface
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#a0a0a0",
    textAlign: "center",
    marginTop: 6,
  },
  
  previewContainer: { 
    flex: 1,
    position: "relative",
  },
  preview: { 
    flex: 1 
  },
  
  // Scan Overlay
  scanOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: width * 0.8,
    height: width * 0.6,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#4facfe",
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanInstruction: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 30,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  
  // Thumbnail
  thumbnailContainer: {
    position: "absolute",
    top: 100,
    right: 20,
    zIndex: 2,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderWidth: 3,
    borderColor: "#4facfe",
    borderRadius: 12,
  },
  thumbnailBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#4facfe",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  thumbnailBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  
  // Controls
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  controlButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
    marginTop: 4,
  },
  galleryButton: {
    backgroundColor: "rgba(79,172,254,0.2)",
    borderColor: "#4facfe",
  },
  infoButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  
  // Capture Button
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4facfe",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#4facfe",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    borderWidth: 4,
    borderColor: "#fff",
  },
  captureButtonDisabled: {
    backgroundColor: "#666",
    shadowOpacity: 0,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
});