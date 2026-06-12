using System;
using System.Diagnostics;

class App {
  [STAThread]
  static void Main() {
    var psi = new ProcessStartInfo("cmd.exe", "/c start msedge --app=\"https://distribuidoraeinverisones.netlify.app\" --window-size=1280,900") {
      CreateNoWindow = true,
      UseShellExecute = false
    };
    Process.Start(psi);
  }
}
