// XpiInstaller
// By Pike (Heavily inspired by code from Henrik Gemal and Stephen Clavering)

var XpiInstaller = {

	// --- Editable items begin ---
	extFullName: 'Image Zoom', // The name displayed to the user (don't include the version)
	extShortName: 'imagezoom', // The leafname of the JAR file (without the .jar part)
	extVersion: '0.3.0.20071227',
	extAuthor: 'Jason Adams',
	extLocaleNames: ["en-US","sl-SI","hu-HU","fr-FR","de-DE","zh-TW","ja-JP","cs-CZ","ko-KR","es-ES","es-AR","it-IT","tr-TR", "zh-CN", "pt-BR", "ru-RU", "mk-MK", "nl-NL", "he-IL", "uk-UA", "ro-RO", "be-BY", "sv-SE", "fi-FI", "hr-HR", "pl-PL", "sk-SK", "sr-YU"],
	extSkinNames: ['classic'], // e.g. ['classic', 'modern']
	extPostInstallMessage: null, // Set to null for no post-install message
	// --- Editable items end ---

	profileInstall: true,
	silentInstall: true,

	install: function()	{
		var jarName = this.extShortName + '.jar';
		var profileDir = Install.getFolder('Profile', 'chrome');
		var prefDir = Install.getFolder('Program', 'defaults/pref');
		
		// Parse HTTP arguments
		this.parseArguments();

		// Init install
		var dispName = this.extFullName + ' ' + this.extVersion;
		var regName = '/' + this.extAuthor + '/' + this.extShortName;
		
		
		// Check if extension is already installed in profile
		if (File.exists(Install.getFolder(profileDir, jarName))) {
			Install.uninstall(regName);
			if (!this.silentInstall) {
				Install.alert('Updating existing Profile install of ' + this.extFullName + ' to version ' + this.extVersion + '.');
			}
			this.profileInstall = true;
		} else if (!this.silentInstall) {
			// Ask user for install location, profile or browser dir?
			this.profileInstall = Install.confirm('Install ' + this.extFullName + ' ' + this.extVersion + ' to your Profile directory (OK) or your Browser directory (Cancel)?');
		}


		Install.initInstall(dispName, regName, this.extVersion);

		// Find directory to install into
		var installPath;
		if (this.profileInstall) installPath = profileDir;
		else installPath = Install.getFolder('chrome');

		// Add JAR file
		Install.addFile(null, 'chrome/' + jarName, installPath, null);
		
		// Add Prefs File
		Install.addFile(this.extShortName, 'defaults/preferences/imagezoom-defaults.js', prefDir, null);

		// Register chrome
		var jarPath = Install.getFolder(installPath, jarName);
		var installType = this.profileInstall ? Install.PROFILE_CHROME : Install.DELAYED_CHROME;

		// Register content
		Install.registerChrome(Install.CONTENT | installType, jarPath, 'content/');

		// Register skins
		for (var skin in this.extSkinNames) {
			var regPath = 'skin/' + this.extSkinNames[skin] + '/' + this.extShortName + '/';
			Install.registerChrome(Install.SKIN | installType, jarPath, regPath);
		}
		
		// Register locales
		for (var locale in this.extLocaleNames) {
			var regPath = 'locale/' + this.extLocaleNames[locale] + '/';
			Install.registerChrome(Install.LOCALE | installType, jarPath, regPath);
		}
		
		// Perform install
		var err = Install.performInstall();

		if (err == Install.SUCCESS || err == Install.REBOOT_NEEDED) {
			if (!this.silentInstall && this.extPostInstallMessage) {
				Install.alert(this.extPostInstallMessage);
			}
		} else {
			this.handleError(err);
			return;
		}
	},

	parseArguments: function() {
		// Can't use string handling in install, so use if statement instead
		var args = Install.arguments;

		if (args == 'p=0') {
			this.profileInstall = false;
			this.silentInstall = true;
		} else if (args == 'p=1') {
			this.profileInstall = true;
			this.silentInstall = true;
		}
	},

	handleError: function(err) {
		Install.alert('Error: Could not install ' + this.extFullName + ' ' + this.extVersion + ' (Error code: ' + err + ')\nPlease visit http://imagezoom.yellowgorilla.net/faq/ for help with this issue.');
		Install.cancelInstall(err);
	}
};

XpiInstaller.install();
