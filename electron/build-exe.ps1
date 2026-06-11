Add-Type -AssemblyName System.Windows.Forms

$code = @'
using System;
using System.Windows.Forms;

public class AppForm : Form {
    public AppForm() {
        this.Text = "Ferreteria Mathias";
        this.Width = 1280;
        this.Height = 900;
        this.StartPosition = FormStartPosition.CenterScreen;

        var web = new WebBrowser();
        web.Dock = DockStyle.Fill;
        web.ScriptErrorsSuppressed = true;
        web.IsWebBrowserContextMenuEnabled = false;
        web.AllowWebBrowserDrop = false;
        web.Url = new Uri("https://distribuidoraeinverisones1.netlify.app");
        this.Controls.Add(web);
    }

    [STAThread]
    public static void Main() {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new AppForm());
    }
}
'@

$refs = @()
$refs += [System.Windows.Forms.Form].Assembly.Location
$refs += [System.Windows.Forms.Application].Assembly.Location

$exePath = Join-Path $PSScriptRoot "Ferreteria.exe"
Add-Type -TypeDefinition $code -Language CSharp -ReferencedAssemblies $refs -OutputAssembly $exePath
Write-Host "EXE creado en: $exePath"
