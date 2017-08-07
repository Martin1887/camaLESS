# Version 2.1.2 already available!

# Version 2.0: CSS variables support
In version 2.0 optionally CSS variables can be used instead LESS. This is convenient for using lower resources taking advantage of newer browsers capabilities. Version 2.0 doesn't break anything and it is fully compatible with 1.x versions, major version has changed because CSS variables support is a high level improvement.

However, not all browsers -cough- Internet Explorer -cough- support CSS variables (full list of brosers compatibility in http://caniuse.com/#feat=css-variables). Therefore, the following check is recommended for using CSS variables if browser supports them and LESS otherwise:

	var useCssVars = false;
	if (window.CSS && window.CSS.supports && window.CSS.supports('--test-var', 0)) {
		useCssVars = true;
		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = '{css_style_path}';
		document.getElementsByTagName('head')[0].appendChild(link);
	} else {
		less = {
			env: 'production',
			async: false,
			globalVars: {
				{custom_LESS_variables}
			}
		};
		var link = document.createElement('link');
		link.rel = 'stylesheet/less';
		link.type = 'text/css';
		link.href = '{less_style_path}';
		document.getElementsByTagName('head')[0].appendChild(link);

		var script = document.createElement('script');
		script.src = '{less.js_path}';
		script.type = 'text/javascript';
		document.getElementsByTagName('head')[0].appendChild(script);
	}

A full example using CSS variables and this check is available in examples folder.


# camaLESS
camaLESS is an open source library under Apache 2.0 license customizable color themes.

camaLESS has been tested on Firefox, Chrome, Internet Explorer and Edge. Nevertheless, it should work on all browsers since it has been coded following browsers compatibility rules. Please report an issue if it does not work properly on any browser.

An example of camaLESS application is RAEfox (https://github.com/Martin1887/RAEfox), a JS application that allows search definitions in castilian Wiktionary. Initially camaLESS has been developed inside RAEfox, so you can find previous commits in that repository.

The color picker used in camaLESS has been developed by Peter Dematté and it can be found under MIT license in https://github.com/PitPik/colorPicker.


camaLESS is coded in vanilla JavaScript and it uses indexedDB to save the color themes and user selection and less.js to dinamically change CSS variables.

camaLESS is compatible with webL10n (https://github.com/fabi1cazenave/webL10n) as localization library and it provides a number of options. The easier way of use camaLESS is calling the initCamaLess or openCamaLessDb function, but as all functions are public you can use them to your own purposes. Both functions are equivalent (initCamaLess is recommended for better readability) and they have the following syntax:

initCamaLess(config) where config object has the following properties (optional properties are between square brackets):

- dbName: Database name, it must be unique for your application A good practice is using the name of your application followed by '_camaLESSdb'.

- less: LESS object. You must import and declare less.js before calling this function. Optional if useCssVars.

- types: Array of strings. Types of color themes in your application. You can have more than one theme type, for instance, you may have a theme for the main content, another theme for the menu, another theme for reader and another theme for dialogs.

- presets: Preset themes in your application (written in database creation in the first time that the app is opened). The format is an array with name and values attributes where name is the store name and values is its themes.

- [forms]: Array of forms DOM objects to be submitted. Usually you only have a form. If null, undefined or empty array camaLess is initialized but without color themes forms (useful when you have a number of pages and color themes are editable only in one of them).

- [callbacks]: Optional array of callback functions (each callback corresponds to a form) executed when the form is cancelled and submitted.

- [formsStores]: Optional array of array of strings (string[][]). Each array corresponds to a form. This parameter is useful when you want a form for each color theme type. For instance, you may have a form for reader theme and another form for the application theme.

- [formsClasses]: Optional array of strings. Classes applied to each form in string format (concatenate classes with spaces for more than one class). If a form has not class the default is used (camaLessForm).

- [formsDataTypes]: Optional array of strings. data-type property for every form section. Can be null. Default value is 'list' for every form.

- [almostOneThemeCB]: Optional callback fired when the user try to save a form without themes. By default an alert with the 'almostOneTheme' l10n tag is used.

- [sameNameThemesCB]: Optional callback fired when the user try to save a form with a number of themes with the same name. It has as argument the name of the duplicated theme. By default an alert with the 'themeName' l10n tag concatenated with the name of the duplicated theme and the 'themesDifferentName' l10n tag is used.

- [quickPanel]: DOM object of a container in which insert themes in a concise manner. Can be null. Preview with 'this' specification has to be defined for quickPanel themes colors

- [quickPanelSettingsAction]: Function executed when settings icon is clicked in quickPanel (usually open camaLess form). If null and quickPanel not null quickPanel is displayed without settings icon.

- [useCssVars]: Boolean indicating if CSS vars are used instead LESS.



openCamaLessDb(name, less, types, defaults, forms, callbacks, formsStores, formsClasses, formsDataTypes, almostOneThemeCB, sameNameThemeCB, quickPanel, quickPanelSettingsAction) where:

- name: Database name, it must be unique for your application. A good practice is using the name of your application followed by '_camaLESSdb'.

- less: LESS object. You must import and declare less.js before calling this function. Optional if useCssVars.

- types: Array of strings. Types of color themes in your application. You can have more than one theme type, for instance, you may have a theme for the main content, another theme for the menu, another theme for reader and another theme for dialogs.

- defaults: Preset themes in your application (written in database creation in the first time that the app is opened). The format is an array with name and values attributes where name is the store name and values is its themes.

- forms: Array of forms DOM objects to be submitted. Usually you only have a form. If empty array camaLess is initialized but without color themes forms (useful when you have a number of pages and color themes are editable only in one of them).

- callbacks: Optional array of callback functions (each callback corresponds to a form) executed when the form is cancelled and submitted.

- formsStores: Optional array of array of strings (string[][]). Each array corresponds to a form. This parameter is useful when you want a form for each color theme type. For instance, you may have a form for reader theme and another form for the application theme.

- formsClasses: Optional array of strings. Classes applied to each form in string format (concatenate classes with spaces for more than one class). If a form has not class the default is used (camaLessForm).

- formsDataTypes: Optional array of strings.  data-type property for every form section. Default value is 'list' for every form.

- almostOneThemeCB: Optional callback fired when the user try to save a form without themes. By default an alert with the 'almostOneTheme' l10n tag is used.

- sameNameThemesCB: Optional callback fired when the user try to save a form with a number of themes with the same name. It has as argument the name of the duplicated theme. By default an alert with the 'themeName' l10n tag concatenated with the name of the duplicated theme and the 'themesDifferentName' l10n tag is used.

- quickPanel: Optional DOM object of a container in which insert themes in a concise manner. Can be null. Preview with 'this' specification has to be defined for quickPanel themes colors

- quickPanelSettingsAction: Optional function executed when settings icon is clicked in quickPanel (usually open camaLess form). If null and quickPanel not null quickPanel is displayed without settings icon.

- useCssVars: Boolean indicating if CSS vars are used instead LESS.

The structure of the indexedDB database is an array of stores where each store is as follows:

	{
		name: The name of the type of theme,
		values: An array with the existing themes,
		preview: An optional object used to apply CSS to the form while the user select or edit a theme.
			Without preview the style of the form never changes until save the form (if the form has its style theme variables) and quickPanel themes have not the proper colors. This object has the following structure:
			{'selector': 'CSS style', ...} where the special selector 'this' is used for the whole form
	}
where each theme (each element of values array) is as follows:

	{
		name: internal name of the theme,
		shownName: translated name using l10n (optional), if it is not specified, name is displayed,
		selected: boolean that says which theme is selected (1 or 0, only one theme selected),
		order: order of the theme in the store,
		values: object with variables and colors, variables must start by '@'
	}


## Basic usage

To use camaLESS follow the following steps. For more examples view the examples folder.

1. Initialize your LESS object and load less.js or load CSS variables:

	Classic mode, always using LESS.

		<link href="css/style.less" rel="stylesheet/less" type="text/css">
		<script type="text/javascript">
			less = {
				env: 'production',
				async: false,
				globalVars: {
					background: '#151515',
					foreground: '#BBB',
					links: '#8AF',
					linksBackground: 'rgba(87, 187, 255, 0.2)',
					listsHeader: '#FFAA15'
				}
			};
		</script>
		<script src="js/less-2.7.1.min.js"></script>
		<script type="text/javascript" src="js/camaLESS/camaLESS.min.js"></script>
		<!-- JS where preset themes are defined and camaLessOpenDb is called -->
		<script type="text/javascript" src="js/color_themes.js"></script>
		<script type="text/javascript"
			src="js/camaLESS/colorPicker/javascript_implementation/jsColorPicker.min.js">
		</script>
		<link href="js/camaLESS/camaLESS.min.css" rel="stylesheet" type="text/css">

	New in 2.0: check if CSS variables are supported and then using them, otherwise using LESS.

		<script>
			var useCssVars = false;
			if (window.CSS && window.CSS.supports && window.CSS.supports('--test-var', 0)) {
				useCssVars = true;
				var link = document.createElement('link');
				link.rel = 'stylesheet';
				link.type = 'text/css';
				link.href = 'style.css';
				document.getElementsByTagName('head')[0].appendChild(link);
			} else {
				less = {
					env: 'production',
					async: false,
					globalVars: {
						background: '#151515',
						foreground: '#BBB',
						links: '#8AF',
						linksBackground: 'rgba(87, 187, 255, 0.2)',
						listsHeader: '#FFAA15'
					}
				};
				var link = document.createElement('link');
				link.rel = 'stylesheet/less';
				link.type = 'text/css';
				link.href = 'style.less';
				document.getElementsByTagName('head')[0].appendChild(link);

				var script = document.createElement('script');
				script.src = '{less.js_path}';
				script.type = 'text/javascript';
				document.getElementsByTagName('head')[0].appendChild(script);
			}
		</script>
		<script type="text/javascript" src="js/camaLESS/camaLESS.min.js"></script>
		<!-- JS where preset themes are defined and camaLessOpenDb is called -->
		<script type="text/javascript" src="js/color_themes.js"></script>
		<script type="text/javascript"
			src="js/camaLESS/colorPicker/javascript_implementation/jsColorPicker.min.js">
		</script>
		<link href="js/camaLESS/camaLESS.min.css" rel="stylesheet" type="text/css">

	camaLESS.css is usually used, but for full screen forms or dialogs you may prefer camaLESS_absolute.css.

2. Create your preset themes (for instance in color_themes.js):

		var themes = [{name: 'ColorThemes', values: [
            {name: 'dark', shownName: 'dark',
                values: {'@background': '#151515', '@foreground': '#BBBBBB',
                        '@links': '#88AAFF', '@linksBackground': 'rgba(87, 187, 255, 0.2)',
                        '@listsHeader': '#FFAA15'}},

            {name: 'light', shownName: 'light',
                values: {'@background': '#E8E8E8', '@foreground': '#000000',
                        '@links': '#0000BB', '@linksBackground': 'rgba(0, 213, 255, 0.3)',
                        '@listsHeader': '#DD4E00'}}],

			preview: {'this': 'background: @background; color: @foreground !important;',
				'label': 'color: @foreground !important;', 'a': 'color: @links;',
				'section header': 'color: @listsHeader; border-bottom-color: @listsHeader;'
			}}];

	You can see that selected and order are not specified. In preset themes these fields must not be included. The first theme is the selected theme and the order is the order in the array. Note that **using CSS variables  variable names also begin with '@'**, camaLESS is in charge of replacing '@' by '--' when it applies themes.

3. Call openCamaLessDb or initCamaLess with your options. For instance:

		openCamaLessDb('miApp_camaLESSdb', less, ['colorThemes'], themes,
			[document.getElementById('miForm']));

			OR

		initCamaLess({
	        dbName: 'miApp_camaLESSdb',
	        less: less,
	        types: ['colorThemes'],
	        presets: themes,
	        forms: [document.getElementById('miForm']
	    });



## Examples

In the examples folder you can find the following full and working examples:

### Basic
This is a basic example with common configuration where the themes form is inside a div in the body of the HTML.

### Full screen
This example shows the themes form in full screen when a button is clicked using camaLESS_absolute.css.

### Read only
A powerful feature of camaLESS is that users can customize and create their own themes, but having read only forms is as easy as hide the links inside the camaLESS form. This example does it.

### jQueryDialog
This example puts the themes form inside a jQuery dialog using camaLESS_absolute.css. As extra feature, it hides the form menu with save and cancel buttons and attachs these funcionalities to the modal dialog buttons.

This is done attaching the submit event to the save button click event and calling the function returned by cancelCamaLessForm (with the correct arguments) when the cancel button is clicked.

### 2 pages
Although camaLESS is usually used in one page applications, it is also possible having a number of pages using the configuration created in one of them. This example does it with a main page and a settings page where the color themes form is loaded.

This is done calling openCamaLessDb in all pages but with an empty array of forms in the pages where no forms have to be created.

### quickPanel
This example shows a simple example using the new quick panel.

### quickPanelHiddenForm
This example is similar to the previous one, but with the form hidden to show how an user can change themes without opening and even without knowing the existence of themes form

### quickPanelSettings
This example shows a bigger form (quick panel has horizontal scroll with buttons) with settings icon, which open camaLESS form in this case opening its jQuery Dialog container.

### cssVars
This example shows a full example similar to quickPanelSettings but using CSS variables instead LESS when it is possible (checking and stylesheet loading is done in color_themes.js).
