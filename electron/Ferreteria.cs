using System;
using System.Windows.Forms;
using Microsoft.Win32;

class AppForm : Form {
  [STAThread]
  static void Main() {
    Application.EnableVisualStyles();
    Application.SetCompatibleTextRenderingDefault(false);

    // Force latest IE/Edge rendering engine
    try {
      var key = Registry.CurrentUser.CreateSubKey(@"SOFTWARE\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_BROWSER_EMULATION");
      key.SetValue(AppDomain.CurrentDomain.FriendlyName, 11001, RegistryValueKind.DWord);
      key.Close();
    } catch {}

    var f = new AppForm();
    f.Text = "Ferreteria Mathias";
    f.Width = 1280; f.Height = 900;
    f.StartPosition = FormStartPosition.CenterScreen;
    var w = new WebBrowser();
    w.Dock = DockStyle.Fill;
    w.ScriptErrorsSuppressed = true;
    w.IsWebBrowserContextMenuEnabled = false;
    w.AllowWebBrowserDrop = false;
    w.Url = new Uri("https://distribuidoraeinverisones1.netlify.app");
    f.Controls.Add(w);
    f.FormClosed += (s, e) => Application.Exit();
    Application.Run(f);
  }
}
