import 'package:flutter/material.dart';

// Web-only minimal app
void main() {
  runApp(const CGMAppWeb());
}

class CGMAppWeb extends StatelessWidget {
  const CGMAppWeb({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CGM India - Web Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const WebHomePage(),
    );
  }
}

class WebHomePage extends StatelessWidget {
  const WebHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('CGM India - Web Demo'),
        backgroundColor: Colors.deepPurple,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.health_and_safety, size: 64, color: Colors.deepPurple),
            const SizedBox(height: 20),
            const Text('CGM India', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
            const Text('Child Growth Monitoring', style: TextStyle(fontSize: 18, color: Colors.grey)),
            const SizedBox(height: 40),
            
            // Demo forms
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const ChildRegistrationDemo()),
                );
              },
              icon: const Icon(Icons.person_add),
              label: const Text('Demo Child Registration'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.deepPurple,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
              ),
            ),
            const SizedBox(height: 20),
            
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const ScreeningDemo()),
                );
              },
              icon: const Icon(Icons.monitor_weight),
              label: const Text('Demo Screening'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
              ),
            ),
            const SizedBox(height: 40),
            
            const Card(
              margin: EdgeInsets.all(20),
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Text('Web Demo Features:', style: TextStyle(fontWeight: FontWeight.bold)),
                    SizedBox(height: 10),
                    Text('✓ Child registration forms'),
                    Text('✓ Screening data entry'),
                    Text('✓ Diet tracking interface'),
                    Text('✓ Analytics dashboard'),
                    Text('✗ ML photo analysis (mobile only)'),
                    Text('✗ Offline storage (mobile only)'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ChildRegistrationDemo extends StatelessWidget {
  const ChildRegistrationDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Child Registration Demo')),
      body: const Center(
        child: Text('Child registration form would go here', style: TextStyle(fontSize: 18)),
      ),
    );
  }
}

class ScreeningDemo extends StatelessWidget {
  const ScreeningDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Screening Demo')),
      body: const Center(
        child: Text('Screening data entry form would go here', style: TextStyle(fontSize: 18)),
      ),
    );
  }
}