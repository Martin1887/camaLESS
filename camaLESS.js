/*
 * CamaLESS: JavaScript library for customized color themes
 *
 *
 * Copyright 2016 Marcos Martín Pozo Delgado
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/*
 * Version 2.1.2
 */

var camaLess = {

	/**
	 * LESS object
	 */
	less: null,

	/**
	 * IndexedDB database. Structure is as follows:
	 * an array of stores (types of themes) which one with name, preview and values with
	 * this structure:
	 * name: database internal name
	 * shownName: shown name in interface (customizable using l10n)
	 * selected: boolean that says which theme is selected (1 or 0)
	 * values: object with colors. Indexes are color variable names
	 * order: order of theme in store.
	 * @type indexedDb
	 */
	camaLessDb: null,

	/**
	 * Different types of color themes in application
	 * @type array
	 */
	stores: [],

	/**
	 * Form without themes error callback
	 * @type function
	 */
	almostOneThemeCallback: null,

	/**
	 * Form with a number of themes with the same name error callback
	 * @type function
	 * @param name The name of the themes
	 */
	sameNameThemesCallback: null,

	/*
	 * Localized text variables
	 */
	themeName: '',
	themesDifferentName: '',
	almostOneTheme: '',

	/**
	 * false for using less, true for using CSS variables
	 * @type boolean
	 */
	 cssVars: false
};
if (document.currentScript) {
	camaLess.path = document.currentScript.src;
} else {
	var scripts = document.getElementsByTagName("script");
	camaLess.path = scripts[scripts.length - 1].src;
}
camaLess.path = camaLess.path.substring(0, camaLess.path.lastIndexOf('/'));


if (navigator.mozL10n) {
	navigator.mozL10n.ready(function() {
		// grab l10n object
		var _ = navigator.mozL10n.get;

		camaLess.themeName = _('themeName');
		camaLess.themesDifferentName = _('themesDifferentName');
		camaLess.almostOneTheme = _('almostOneTheme');
	});
}

/*
 * Functions to manipulate database
 */

/**
 * Initialize camaLess with a config object. This function is an alternative to openCamaLessDb function.
 * @param {object} config A config object with the following properties (optional properties are between square brackets):
 * 		dbName: {string} Database name, it must be unique for your application.
 *		less: {object} LESS object. Optional if useCssVars.
 *		types: {array} Types of color themes in your application.
 *		presets: {array} Preset themes in application (to write in database creation in
 * 					the first time that the app is opened). The format is an array with name and
 *	 				values attributes where name is the store name and values is its themes.
 *		[forms]: {array} Forms to be submitted. If null, undefined or empty array camaLess is initialized but without
 *					color themes forms (useful when you have a number of pages and color themes are editable only in one of them).
 *		[callbacks]: {array} Callback for every form submission. Can be null.
 *		[formsStores]: {array} Themes types for every form. Can be null. Useful if you have different style types,
 *					for instance a form for application themes and another one for menu themes.
 *		[formsClasses]: {array} CSS class for every form. Can be null. Default value is 'camaLessForm' for every form.
 *		[formsDataTypes]: {array} data-type property for every form section. Can be null. Default value is 'list' for every form.
 *		[quickPanel]: {HTMLElement} DOM object of a container in which insert themes in a concise manner. Can be null. Preview with 'this'
 						specification has to be defined for quickPanel themes colors
 *		[quickPanelSettingsAction]: {function} Function executed when settings icon is clicked in quickPanel (usually open camaLess form).
 						If null and quickPanel not null quickPanel is displayed without settings icon.
 *		[almostOneThemeCB]: {function} Optional callback for form without themes error.
 *					Default value is an alert with almostOneTheme l10n localized variable.
 *		[sameNameThemesCB]: {function} Optional callback for form with a number of themes with the same name.
 *					Default value is an alert with themeName and themesDifferentName l10n localized variables.
 *		[useCssVars]: {boolean} true for using CSS variables, otherwise for using less
 *
 * @returns true
 */
 function initCamaLess(config) {
 	return openCamaLessDb(config.dbName, config.less, config.types, config.presets,
 		config.forms ? config.forms : [], config.callbacks, config.formsStores, config.formsClasses,
 		config.formsDataTypes, config.almostOneThemeCB, config.sameNameThemesCB, config.quickPanel, config.quickPanelSettingsAction, config.useCssVars);
 }

/**
 * This function remains working, but is better to use initCamaLess for better readability.
 * Open camaLESS database with given name (this name must be unique for your
 * application in order to not collide with other applications, a good practice
 * is user your application name as appName_camalesscamaLessDb). It's necessary give at
 * least a objectStore name (each objectStore is a different type of color
 * theme).
 * @param {string} name Database name, it must be unique for your application.
 * @param {object} less LESS object. Optional if useCssVars.
 * @param {array} types Types of color themes in your application.
 * @param {array} defaults Default themes in application (to write in database creation in
 * the first time that the app is opened). The format is an array with name and
 * values attributes where name is the store name and values is its themes.
 * @param {array} forms Forms to be submitted.
 * @param {array} callbacks Callback for every form submission. Can be null.
 * @param {array} formsStores Themes types for every form. Can be null.
 * @param {array} formsClasses CSS class for every form. Can be null.
 * @param {array} formsDataTypes DataType for every form list. Can be null.
 * @param {function} almostOneThemeCB Optional callback for form without themes error.
 * @param {function} sameNameThemesCB Optional callback for form with a number of themes with the same name.
 * @param {HTMLElement} quickPanel Optional DOM element in which insert quick panel with a concise manner for selecting themes. Preview with
 * 'this' specification has to be defined for quickPanel themes colors
 * @param {function} quickPanelSettingsAction Optional function called when settings icon of quickPanel is clicked. If null no icon is shown
 * @param {boolean} useCssVars true for using CSS variables, otherwise for using less
 * @returns true
 */
function openCamaLessDb(name, less, types, defaults, forms, callbacks, formsStores,
                            formsClasses, formsDataTypes, almostOneThemeCB, sameNameThemesCB,
							quickPanel, quickPanelSettingsAction, useCssVars) {
    var openRequest = indexedDB.open(name, 1);
	camaLess.less = less;
    camaLess.stores = types;
	if (useCssVars) {
		camaLess.useCssVars = true;
	}
	var newDatabase = false;

	if (almostOneThemeCB) {
		camaLess.almostOneThemeCallback = almostOneThemeCB;
	} else {
		camaLess.almostOneThemeCallback = function() {alert(camaLess.almostOneTheme + '.');};
	}
	if (sameNameThemesCB) {
		camaLess.sameNameThemesCallback = sameNameThemesCB;
	} else {
		camaLess.sameNameThemesCallback = function(name) {
			alert(camaLess.themeName + ' ' + name + ' ' + camaLess.themesDifferentName + '.');
		};
	}

    openRequest.onsuccess = function(event) {
        camaLess.camaLessDb = openRequest.result;
		if (!newDatabase) {
			applyThemesAndCreateForms(forms, callbacks, formsStores, formsClasses, formsDataTypes, quickPanel, quickPanelSettingsAction);
		}
    };

    openRequest.onupgradeneeded = function(event) {
		newDatabase = true;
		camaLess.camaLessDb = event.target.result;

		var added = 0;
		// preview (stores.length) + themes
		var total = camaLess.stores.length;

		var previewStore = camaLess.camaLessDb.createObjectStore('preview', {keyPath: 'name'});

		for (var i = 0; i < camaLess.stores.length; i++) {
			var previewRequest = previewStore.add({name: camaLess.stores[i], preview: defaults[i].preview});
			previewRequest.onsuccess = function() {
				added++;
			};
		}

		for (var i = 0; i < camaLess.stores.length; i++) {
			var objectStore = camaLess.camaLessDb.createObjectStore(camaLess.stores[i],
				{keyPath: 'name'});
			objectStore.createIndex('selected', 'selected');

			objectStore.transaction.oncomplete = function(e) {

				for (var i = 0; i < defaults.length; i++) {
					total += defaults[i].values.length;
				}

				for (var i = 0; i < defaults.length; i++) {
					var store = defaults[i].name;
					for (var j = 0; j < defaults[i].values.length; j++) {
						var theme = defaults[i].values[j];
						newColorTheme(theme.name, theme.shownName, theme.values, j + 1, store,
						function() {
							added++;

							if (added === total) {
								applyThemesAndCreateForms(forms, callbacks,
											formsStores, formsClasses, formsDataTypes, quickPanel, quickPanelSettingsAction);
							}
						});
					}
				}
			};
		}
    };


    return true;
}

/**
 * Apply color themes and create all forms. It is used just after open database.
 * @param {array} forms Forms to be submitted.
 * @param {array} callbacks Callback for every form submission. Can be null.
 * @param {array} formsStores Themes types for every form. Can be null.
 * @param {array} formsClasses CSS class for every form. Can be null.
 * @param {array} formsDataTypes DataType for every form list. Can be null.
 * @param {HTMLElement} quickPanel HTMLElement in which insert quickPanel
 * @param {function} quickPanelSettingsAction Function called when settings icon of quickPanel is clicked
 * @returns true
 */
function applyThemesAndCreateForms(forms, callbacks, formsStores, formsClasses, formsDataTypes, quickPanel, quickPanelSettingsAction) {
    applyCamaLessColorTheme();

	for (var i = 0; i < forms.length; i++) {
        var stores = null;
        var clas = null;
        var dataType = null;
        var callback = null;
        if (formsStores) {
            stores = formsStores[i];
        }
        if (formsClasses) {
            clas = formsClasses[i];
        }
        if (formsDataTypes) {
            dataType = formsDataTypes[i];
        }
        if (callbacks) {
            callback = callbacks[i];
        }
        // Create form of all types of themes
        createCamaLessForm(stores, forms[i], clas, dataType, callback, quickPanel, quickPanelSettingsAction);
    }

    return true;
}

/**
 * Add color theme to the type of color themes.
 * @param {string} name Internal name of theme.
 * @param {object{shownName: string, l10n: boolean}} shownName Object with name
 * shown in interface and boolean indicating if it is data-l10n-id.
 * @param {object{var: string, value: string}} values Object with variables and
 * values.
 * @param {int} order Order of theme in the type of theme. If undefined or null
 * the subsequent of last is chosen.
 * @param {string} store The type of color theme.
 * @param {function} callback Optional success function
 * @returns true
 */
function newColorTheme(name, shownName, values, order, store, callback) {
    var objectStore = camaLess.camaLessDb.transaction([store], 'readwrite').objectStore(store);

    var max = 0;
    if (!order) {
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor && cursor.value.order >= max) {
                max = cursor.value.order + 1;
                cursor.continue();
            }
            order = max;

            var request = objectStore.add({name: name, shownName: shownName,
                    values: values, selected: 0, order: order});

            request.onsuccess = function(event) {
				if (order === 1) {
                    if (callback) {
						selectColorTheme(name, store, callback);
					} else {
						selectColorTheme(name, store);
					}
                } else {
					if (callback) {
						callback();
					}
				}
            };
        };
    } else {
        var request = objectStore.add({name: name, shownName: shownName,
                    values: values, selected: 0, order: order});

        request.onsuccess = function(event) {
			if (order === 1) {
                if (callback) {
					selectColorTheme(name, store, callback);
				} else {
					selectColorTheme(name, store);
				}
            } else {
				if (callback) {
					callback();
				}
			}
        };
    }

    return true;
}

/**
 * Edit color theme to the type of color themes.
 * @param {string} name Internal name of theme.
 * @param {object{shownName: string, l10n: boolean}} shownName Object with name
 * shown in interface and boolean indicating if it is data-l10n-id.
 * @param {object{var: string, value: string}} values Object with variables and
 * values.
 * @param {int} order Order of theme in the type of theme
 * @param {string} store The type of color theme.
 * @param {function} callback Optional success function
 * @returns true
 */
function editColorTheme(name, shownName, values, order, store, callback) {
    var objectStore = camaLess.camaLessDb.transaction([store], 'readwrite').objectStore(store);
    var request = objectStore.get(name);
    request.onsuccess = function(event) {
        var data = request.result;
        data.shownName = shownName;
        data.values = values;
        data.order = order;
        objectStore.put(data);

		if (callback) {
			callback();
		}
    };


    return true;
}

/**
 * Remove color theme from type of color themes (and reduce the order index of
 * subsequent themes).
 * @param {string} name The name of color theme.
 * @param {string} store The type of color theme.
 * @param {function} callback Optional success function
 * @returns true
 */
function removeColorTheme(name, store, callback) {
    var objectStore = camaLess.camaLessDb.transaction([store], 'readwrite').objectStore(store);
	var request = objectStore.delete(name);

	request.onsuccess = function(event) {
		if (callback) {
			callback();
		}
	};

    return true;
}


/**
 * Deselect selected color theme and select color theme passed from type of
 * color themes as chosen theme.
 * @param {string} name The name of color theme.
 * @param {string} store The type of color theme.
 * @param {function} callback Optional success function
 * @returns true
 */
function selectColorTheme(name, store, callback) {
	var objectStore = camaLess.camaLessDb.transaction([store], 'readwrite').objectStore(store);
    var index = objectStore.index('selected');
    index.get(1).onsuccess = function(event) {
		var res = event.target.result;
        if (res) {
            res.selected = 0;
            objectStore.put(res);
        }
		var request = objectStore.get(name);
		request.onsuccess = function(event) {
			var data = request.result;
			data.selected = 1;
			var requestUpdate = objectStore.put(data);

			if (callback) {
				requestUpdate.onsuccess = function() {
					callback();
				};
			}
		};
    };


    return true;
}


/*
 * Form
 */

/**
 * Create a camaLESS form with store color themes. If store is undefined all
 * types of color themes are entered in the form.
 * @param {string} store Type of color theme.
 * @param {form} form Form object in which enter fields.
 * @param {string} clas CSS class. Default is camaLessForm.
 * @param {string} dataType List of themes HTML data-type attribute. Default is list.
 * @param {function} callback Function to execute after submit.
 * @param {HTMLElement} quickPanel HTMLElement in which insert quickPanel
 * @param {function} quickPanelSettingsAction Function called when settings icon of quickPanel is clicked
 * @returns true
 */
function createCamaLessForm(store, form, clas, dataType, callback, quickPanel, quickPanelSettingsAction) {
    var formStores = store ? [store] : camaLess.stores;
    clas = clas ? clas : 'camaLessForm';
    dataType = dataType ? dataType : 'list';

    // Empty form in order to overwrite it
	form.innerHTML = '';
    var themesListHtml = '<section class="camaLessFormListPanel" data-type="' + dataType + '">';
	if (form.className.indexOf(clas) < 0) {
		form.className += ' ' + clas;
	}

	var quickPanelHTML = '';
	if (quickPanel) {
		quickPanelHTML = '<ul class="camaLess-quick-panel-container"><li>';
	}

	var themesFieldsHtml = '';

    // It's neccessary knowing when all asynchronous request are finished
    // to add content to form
    var finished = 0;
	var quickPanelFinished = 0;
	var quickPanelIterations = {};
    var transactions = {};
    var themes = {};
    for (var i = 0; i < formStores.length; i++) {
        transactions[formStores[i]] = camaLess.camaLessDb.transaction([formStores[i]], 'readonly');
        var objectStore = transactions[formStores[i]].objectStore(formStores[i]);
        themes[formStores[i]] = [];

        objectStore.openCursor().onsuccess = function(event) {
            var currentStore = event.target.source.name;

            var cursor = event.target.result;
            if (cursor) {
                themes[currentStore].push({name: cursor.value.name, shownName: cursor.value.shownName,
                            values: cursor.value.values, selected: cursor.value.selected,
                            order: cursor.value.order});
                cursor.continue();
            }
        };

        transactions[formStores[i]].oncomplete = function(event) {
            var currentStore = event.target.db.objectStoreNames[0];

            // Write form only when previous stores have finished
            var interForm = setInterval(function() {
                if (finished === formStores.indexOf(currentStore)) {
                    window.clearInterval(interForm);
					quickPanelIterations[currentStore] = 0;
                    // Themes sort in function of 'order' field
                    themes[currentStore].sort(function(a, b) { return a.order - b.order; });

                    themesListHtml += '<header data-l10n-id="' + currentStore + '">'
                        + currentStore + '</header>';
                    themesListHtml += '<table data-theme-id="tableForm' + currentStore + finished + '">';
					themesFieldsHtml += '<table data-theme-id="tableFormFields' + currentStore + finished + '">';

                    for (var j = 0; j < themes[currentStore].length; j++) {
                        var theme = themes[currentStore][j];
                        themesListHtml += '<tr data-theme-id="themesListTr' + currentStore + j + '">'
									+ '<td><input id="radio' + currentStore + j + '" type="radio" name="' + currentStore
                                    + '" ' + (theme.selected ? 'checked="checked"' : '')
                                    + ' onclick="applyPreview(\'' + currentStore + '\', false, '
									+ 'this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode);">'
									+ '<label for="radio' + currentStore + j + '"></label></td>';
                        themesListHtml += '<td class="themeName"><label '
                                + (theme.shownName ?
                                ' data-l10n-id="' + theme.shownName + '"'
                                : '') + '>'
                                + theme.name + '</label></td>';
						// edit button
						themesListHtml += '<td><a class="iconLink" href="#" onclick="return editTheme'
                                    + '(this.parentNode.parentNode.getAttribute(\'data-theme-id\'), \''
                                    + currentStore + '\');"><img width="24" height="24"'
                                    + ' src="' + camaLess.path + '/img/edit.svg" alt="edit"></a>'
                                    + '</td>';

						// 'x' button
                        themesListHtml += '<td><a class="iconLink" href="#" onclick="return eraseTheme'
                                    + '(this.parentNode.parentNode);"><img width="24" height="24"'
                                    + ' src="' + camaLess.path + '/img/erase_cross.png" alt="erase"></a>'
                                    + '</td>';

                        themesListHtml += '</tr>';


						themesFieldsHtml += '<tr data-theme-id="themesFieldsTr' + currentStore + j + '">';
						themesFieldsHtml += '<td class="themeName"><input type="text" '
                                + (theme.shownName ?
                                ' data-l10n-id="' + theme.shownName + '"'
                                : '') + ' name="' + theme.name + '" value="'
                                + theme.name + '"'
								+ 'onchange="updateName(this.value, this.parentNode.parentNode.getAttribute(\'data-theme-id\'));"></td>';
                        themesFieldsHtml += '<td class="themeColors"><ul>';
                        for (var variable in theme.values) {
                            themesFieldsHtml += '<li>';
                            // Without first '@'
                            themesFieldsHtml += '<label for="' + theme.name + '-'
                                        + variable.substring(1) + '"'
                                        + ' data-l10n-id="'
                                        + variable.substring(1) + '">' + variable.substring(1) + '</label>';
                            // class color for colorPicker
                            themesFieldsHtml += '<input data-colormode="HEX" class="color" name="'
                                        + variable.substring(1) + '[]"'
                                        + ' autocomplete="off" value="' + theme.values[variable]
                                        + '" onchange="applyPreview(\'' + currentStore + '\', true, '
										+ 'this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode);">';
                            themesFieldsHtml += '</li>';
                        }
                        themesFieldsHtml += '</ul></td>';
						themesFieldsHtml += '</tr>';

						// quickPanel
						if (quickPanel) {
							// set variables that define main background and foreground colors (preview this color
							// and preview this background [or preview this background-color if background is not defined])
							var mainBackgroundVar = '';
							var mainForegroundVar = '';

							var previewStore = camaLess.camaLessDb.transaction(['preview'], 'readonly').objectStore('preview');
							previewStore.get(currentStore).onsuccess = function(event) {
								var preview = event.target.result.preview;
								var currentStore = event.target.result.name;
								var theme = themes[currentStore][quickPanelIterations[currentStore]];
								var main = preview.this;
								mainForegroundVar = main.match(/.*color:\s*(@[A-Za-z\-_0-9]+)[;!\s]*/)[1];
								mainBackgroundVar = main.match(/.*background:\s*(@[A-Za-z\-_0-9]+)[;!\s]*/)[1];
								if (!mainBackgroundVar) {
									mainBackgroundVar = main.match(/.*background-color:\s*(@[A-Za-z\-_0-9]+)[;!\s]*/)[1];
								}

								// insert store separator if not is the first store
								if (quickPanelFinished > 0) {
									quickPanelHTML += '<span class="camaLess-quick-panel-separator"></span>';
								}
								quickPanelHTML += '<span data-theme="' + theme.name
									+ '" data-store="' + currentStore + '" '
									+ 'class="camaLess-quick-panel-theme" style="background: '
									+ theme.values[mainBackgroundVar] + ' !important; border-color: '
									+ theme.values[mainForegroundVar] + ' !important;">'
									+ (theme.selected ? '·' : '') + '</span>';
								if (quickPanelIterations[currentStore] == themes[currentStore].length - 1) {
									quickPanelFinished++;
								}
								quickPanelIterations[currentStore]++;
							};
						}
                    }
                    // '+' button
                    themesListHtml += '<tr><td class="themeAdd" colspan="4"><a href="#" onclick='
                                        + '"return addTheme(this.parentNode.parentNode.parentNode, \''
                                        + currentStore + '\');"><img width="30" '
                                        + 'height="30" src="' + camaLess.path + '/img/add.png" alt="add">'
										+ '<span data-l10n-id="createTheme">Create theme</span></a>'
                                        + '</td></tr>';

                    themesListHtml += '</table>';

					themesFieldsHtml += '</table>';

                    finished++;


					// This final part of the form is written when all request are completed
					if (finished === formStores.length) {

						var quickPanelInterval = setInterval(function() {
							if (!quickPanel || quickPanelFinished === finished) {
			                    window.clearInterval(quickPanelInterval);

								if (quickPanel) {
									if (quickPanelSettingsAction) {
										quickPanelHTML += '<span class="camaLess-quick-panel-separator"></span>';
										quickPanelHTML += '<span class="camaLess-quick-panel-settings">&#x2699;</span>';
									}

									quickPanelHTML += '</li></ul>';
									quickPanel.innerHTML = quickPanelHTML;
									if (quickPanel.className.indexOf('camaLess-quick-panel') < 0) {
										quickPanel.className += ' camaLess-quick-panel';
									}

									// if themes list is bigger than quickPanel add buttons to easy scroll
									if (quickPanel.querySelector('.camaLess-quick-panel-container li').clientWidth
											> quickPanel.clientWidth) {
										quickPanel.innerHTML = '<span onclick="quickPanelScroll'
											+ '(this.parentNode.querySelector(\'.camaLess-quick-panel-container\'), true)" '
											+ 'class="camaLess-quick-panel-button disabled">&#x25C2;</span>'
											+ quickPanel.innerHTML + '<span onclick="quickPanelScroll'
											+ '(this.parentNode.querySelector(\'.camaLess-quick-panel-container\'), false)" '
											+ 'class="camaLess-quick-panel-button">&#x25B8;</span>';
										quickPanel.querySelector('.camaLess-quick-panel-container').className += ' scrolled';
									}

									if (quickPanelSettingsAction) {
										quickPanel.querySelector('.camaLess-quick-panel-settings').onclick =
											quickPanelSettingsAction;
									}

									// bind event onclick to themes
									var themes = quickPanel.querySelectorAll('.camaLess-quick-panel-theme');
									if (!themes.forEach) {
										NodeList.prototype.forEach = Array.prototype.forEach;
									}
									themes.forEach(function(theme) {
										theme.onclick = function() {
											selectColorTheme(theme.getAttribute('data-theme'), theme.getAttribute('data-store'),
												function() {
													applyCamaLessColorTheme();
													createCamaLessForm(store, form, clas, dataType, callback,
														quickPanel, quickPanelSettingsAction);
												}
											);
										};
									});
								}

								themesListHtml += '</section>';
								form.innerHTML += themesListHtml;

								form.innerHTML += '<section class="camaLessFormEditPanel">'
									+ '<div class="camaLessFormBackToList" onclick="backToThemesList(this.parentNode.parentNode);">'
										+ '<img width="30" height="40" src="' + camaLess.path + '/img/back.svg"/>'
									+ '</div>'
									+ '<div class="camaLessFormFields">' + themesFieldsHtml
									+ '</div></section>';

								var cancel = document.createElement('button');
								cancel.attributes['data-l10n-id'] = 'cancel';
								cancel.innerHTML = 'Cancel';
								cancel.type = 'button';
								cancel.dataset['l10nId'] = 'cancel';
								cancel.onclick = cancelCamaLessForm(store, form, clas, dataType, callback, quickPanel, quickPanelSettingsAction);
								form.innerHTML += '<menu>'
												  + '<button class="recommend" type="submit" '
												  + 'data-l10n-id="save">Save</button></menu>';
								form.lastChild.insertBefore(cancel, form.lastChild.lastChild);

								addToCamaLessForms(store, form, clas, dataType, callback, quickPanel, quickPanelSettingsAction);

								// apply preview
								for (var i = 0; i < camaLess.stores.length; i++) {
									applyPreview(camaLess.stores[i], false, form);
								}

								// l10n strings updated
								if (navigator.mozL10n) {
									navigator.mozL10n.ready ( function () {
										// grab l10n object
										var _ = navigator.mozL10n.get;
										// Themes title
										var toTranslate = form.querySelectorAll('input[type="text"]');
										for (var i = 0; i < toTranslate.length; i++) {
											var l10nId = toTranslate[i].getAttribute('data-l10n-id');
											if (l10nId) {
												toTranslate[i].value = _(l10nId);
												toTranslate[i].setAttribute('value', _(l10nId));
											}
										}
										// Color variables
										toTranslate = form.querySelectorAll('label');
										for (var i = 0; i < toTranslate.length; i++) {
											var l10nId = toTranslate[i].getAttribute('data-l10n-id');
											if (l10nId) {
												toTranslate[i].value = _(l10nId);
												toTranslate[i].innerHTML = _(l10nId);
											}
										}

										// Buttons
										toTranslate = form.querySelectorAll('button');
										for (var i = 0; i < toTranslate.length; i++) {
											var l10nId = toTranslate[i].getAttribute('data-l10n-id');
											if (l10nId) {
												toTranslate[i].value  = _(l10nId);
												toTranslate[i].innerHTML = _(l10nId);
											}
										}
										// Headers
										toTranslate = form.querySelectorAll('header');
										for (var i = 0; i < toTranslate.length; i++) {
											var l10nId = toTranslate[i].getAttribute('data-l10n-id');
											if (l10nId) {
												toTranslate[i].innerHTML = _(l10nId);
											}
										}
										// Add button
										toTranslate = form.querySelectorAll('span');
										for (var i = 0; i < toTranslate.length; i++) {
											var l10nId = toTranslate[i].getAttribute('data-l10n-id');
											if (l10nId) {
												toTranslate[i].innerHTML = _(l10nId);
											}
										}
									});
								}
								// colorPicker in all inputs
								jsColorPicker('input.color', {
									customBG: '#222',
									readOnly: false,
									init: function (elm, colors) {
										elm.style.backgroundColor = elm.value;
										elm.style.color = colors.rgbaMixBGMixCustom.luminance > 0.22 ? '#222' : '#ddd';
									}
								});
								// When write to change background color
								var inputs = document.querySelectorAll('input.color');
								for (var i = 0; i < inputs.length; i++) {
									inputs[i].onkeyup = function() {
										this.style.backgroundColor = this.value;
									};
								}
							}
						}, 100);
					}
                }
            }, 100);
        };
    }


    return true;
}

/**
 * Scroll quickPanelList to the left
 * @param {HTMLElement} quickPanelList The ul DOM inner quickPanelList
 * @param {boolean} toLeft true if the scroll is to left
 */
function quickPanelScroll(quickPanelList, toLeft) {
	var toScroll = quickPanelList.querySelector('.camaLess-quick-panel-theme').clientWidth;
	var maxScroll = quickPanelList.querySelector('li').clientWidth - quickPanelList.clientWidth;
	var sign = toLeft ? -1 : 1;
	var arrows = quickPanelList.parentNode.querySelectorAll('.camaLess-quick-panel-button');
	var leftArrow = arrows[0];
	var rightArrow = arrows[1];

	if ((quickPanelList.scrollLeft > 0 && toLeft) || (quickPanelList.scrollLeft <= maxScroll && !toLeft)) {
		quickPanelList.scrollLeft += sign * toScroll;
		if (quickPanelList.scrollLeft < 0) {
			quickPanelList.scrollLeft = 0;
		}
		if (quickPanelList.scrollLeft == 0) {
			leftArrow.className += ' disabled';
			rightArrow.className = rightArrow.className.replace(' disabled', '');
		} else if (quickPanelList.scrollLeft >= maxScroll) {
			rightArrow.className += ' disabled';
			leftArrow.className = leftArrow.className.replace(' disabled', '');
		} else {
			leftArrow.className = leftArrow.className.replace(' disabled', '');
			rightArrow.className = rightArrow.className.replace(' disabled', '');
		}
	}
}

/**
 * Update a theme label.
 * @param {string} newValue The new name
 * @param {themeTrDataThemeId} themeTrDataThemeId The theme tr data-theme-id to update.
 * @returns false in order to not follow link
 */
function updateName(newValue, themeTrDataThemeId) {
	var label = document.querySelector('[data-theme-id="'
			+ themeTrDataThemeId.replace('themesFieldsTr', 'themesListTr') + '"] .themeName label');
	label.innerHTML = newValue;

	return false;
}

/**
 * Back to themes list
 * @param {form} form The camaLESS form
 * @returns false in order to not follow link
 */
function backToThemesList(form) {
	var editPanel = form.querySelector('.camaLessFormEditPanel');
	var trEditing = form.querySelector('.camaLessFormEditPanel tr.editing');

	trEditing.className = trEditing.className.replace(' editing', '');
	editPanel.className = editPanel.className.replace(' editing', ' backing');
	var listPanel = form.querySelector('.camaLessFormListPanel');
	listPanel.className = listPanel.className.replace(' editing', ' backing');

	var listPanelTrEditing = listPanel.querySelector('[data-theme-id="'
		+ trEditing.getAttribute('data-theme-id').replace('themesFieldsTr', 'themesListTr') + '"]');
	var currentNameValue = trEditing.querySelector('.themeName input').value;
	listPanelTrEditing.querySelector('.themeName label').innerHTML = currentNameValue;
	trEditing.querySelector('.themeName input').setAttribute('value', currentNameValue);

	setTimeout(function() {
		editPanel.className = editPanel.className.replace(' backing', '');
		listPanel.className = listPanel.className.replace(' backing', '');
	}, 1000);

	// apply preview
	for (var i = 0; i < camaLess.stores.length; i++) {
		applyPreview(camaLess.stores[i], false, form);
	}

	// Link must not be followed
	return false;
}

/**
 * Edit a theme showing edit panel.
 * @param {string} themeTrDataThemeId The theme tr data-theme-id to edit.
 * @param {string} store The theme store
 * @returns false in order to not follow link
 */
function editTheme(themeTrDataThemeId, store) {

	var themeTr = document.querySelector('[data-theme-id="'
			+ themeTrDataThemeId.replace('themesListTr', 'themesFieldsTr') + '"]');
    themeTr.className += " editing";

	var editPanel = themeTr.parentNode.parentNode.parentNode.parentNode;
	var form = editPanel.parentNode;

	var listPanel = form.querySelector('.camaLessFormListPanel');
	listPanel.className += ' editing';

	// add class to section
	editPanel.className += ' editing';

	// apply preview
	applyPreview(store, true, form);

    // Link must not be followed
    return false;
}

/**
 * Erase a DOM tr representing a color theme from the form.
 * @param {themeTr} themeTr The theme tr to erase.
 * @returns false in order to not follow link
 */
function eraseTheme(themeTr) {
    var selectAnotherTheme = false;
	var checked = themeTr.querySelector('input[type="radio"]:checked');
	var toClick;
	if (checked) {
		selectAnotherTheme = true;
		toClick = themeTr.parentNode.querySelector('input[type=radio]:not(:checked)');
	}

	// Deletion is done with fade out transition
    themeTr.addEventListener('animationend', function() {
        themeTr.parentNode.removeChild(themeTr);

		var editTr = document.querySelector('[data-theme-id="' + themeTr.getAttribute('data-theme-id')
				.replace('themesListTr', 'themesFieldsTr') + '"]');
		editTr.parentNode.removeChild(editTr);

		if (selectAnotherTheme && toClick) {
			toClick.click();
		}
    });

    themeTr.className += " removingNode";

    // Link must not be followed
    return false;
}

/**
 * Add a DOM tr representing a color theme to the form
 * @param {table} themeTypeTable The table element in which insert tr
 * @param {string} store Type of color theme
 * @returns false in order to not follow link
 */
function addTheme(themeTypeTable, store) {
	var themesListHtml = '';
	var form = themeTypeTable.parentNode.parentNode.parentNode;
	var currentPreviewColors = getCurrentPreviewTheme(store, false, form);
	var themes = form.querySelectorAll('tr[data-theme-id^="themesListTr' + store + '"]').length;
	themesListHtml += '<td><input id="radio' + store + themes + '" type="radio" name="' + store
				+ '" onclick="applyPreview(\'' + store + '\', false, '
				+ 'this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode);"><label for="radio' + store + themes + '"></label></td>';
	themesListHtml += '<td class="themeName"><label data-l10n-id="newTheme">New theme</label></td>';
	// edit button
	themesListHtml += '<td><a href="#" class="iconLink" onclick="return editTheme'
				+ '(this.parentNode.parentNode.getAttribute(\'data-theme-id\'));"><img width="24" height="24"'
				+ ' src="' + camaLess.path + '/img/edit.svg" alt="edit"></a>'
				+ '</td>';

	// 'x' button
	themesListHtml += '<td><a href="#" class="iconLink" onclick="return eraseTheme'
				+ '(this.parentNode.parentNode);"><img width="24" height="24"'
				+ ' src="' + camaLess.path + '/img/erase_cross.png" alt="erase"></a>'
				+ '</td>';

	var themesFieldsHtml = '<tr data-theme-id="themesFieldsTr' + store + themes + '">';
    themesFieldsHtml += '<td class="themeName"><input type="text"'
                + 'name="new" value="New theme" data-l10n-id="newTheme"/></td>';
    themesFieldsHtml += '<td class="themeColors"><ul>';

    var values;
    var objectStore = camaLess.camaLessDb.transaction([store], 'readonly').objectStore(store);
    objectStore.openCursor().onsuccess = function(event) {
        // Only 1st theme is taken, all themes of same type have the same vars
        var cursor = event.target.result;
        if (cursor) {
            values = cursor.value.values;

            for (var variable in values) {
                themesFieldsHtml += '<li>';
                // Without first '@'
                themesFieldsHtml += '<label for="new-'
                            + variable.substring(1) + '"'
                            + ' data-l10n-id="'
                            + variable.substring(1) + '">' + variable.substring(1) + '</label>';
                // class color for colorPicker
                themesFieldsHtml += '<input data-colormode="HEX" class="color" name="'
                            + variable.substring(1) + '[]"'
                            + ' autocomplete="off" value="' + currentPreviewColors[variable.substring(1)] + '"'
							+ ' onchange="applyPreview(\'' + store + '\', true, '
							+ 'this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode);">';
                themesFieldsHtml += '</li>';
            }
            themesFieldsHtml += '</ul></td></tr>';


            var tr = document.createElement('tr');
            tr.innerHTML = themesListHtml;
			var trDataThemeId = 'themesListTr' + store + themes;
			tr.setAttribute('data-theme-id', trDataThemeId);
            // Insert before '+' button
            themeTypeTable.insertBefore(tr, themeTypeTable.lastChild);

			var fieldsSectionTBody = form.querySelector('table[data-theme-id="'
					+ themeTypeTable.parentNode.getAttribute('data-theme-id')
					.replace('tableForm', 'tableFormFields') + '"]').lastChild;
			// Insert at the end
			fieldsSectionTBody.innerHTML += themesFieldsHtml;


            // l10n strings updated
			if (navigator.mozL10n) {
				navigator.mozL10n.ready(function() {
					// grab l10n object
					var _ = navigator.mozL10n.get;

					var label = tr.querySelector('label');
					var l10nId = label.getAttribute('data-l10n-id');
					if (l10nId) {
						label.value = _(l10nId);
						label.innerHTML = _(l10nId);
					}

					// Themes title
					var input = fieldsSectionTBody.lastChild.querySelector('input');
					var l10nId = input.getAttribute('data-l10n-id');
					if (l10nId) {
						input.value = _(l10nId);
						input.setAttribute('value', _(l10nId));
					}

					// Color variables localization
					var lis = fieldsSectionTBody.lastChild.querySelectorAll('label');
					for (var i = 0; i < lis.length; i++) {
						// The first child is the label
						var l10nId = lis[i].getAttribute('data-l10n-id');
						if (l10nId) {
							lis[i].value = _(l10nId) + ':';
							lis[i].innerHTML = _(l10nId) + ':';
						}
					}
				});
			}

            // colorPicker in all inputs
            jsColorPicker('input.color', {
                customBG: '#222',
                readOnly: false,
                init: function (elm, colors) {
                    elm.style.backgroundColor = elm.value;
                    elm.style.color = colors.rgbaMixCustom.luminance > 0.22 ? '#222' : '#ddd';
                }
            });
            // When write to change background color
            var inputs = document.querySelectorAll('input.color');
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].onkeyup = function() {
                    this.style.backgroundColor = this.value;
                };
            }

			// Go to edit
			editTheme(trDataThemeId, store);
        }
    };


    // Link must not be followed
    return false;
}

/**
 * Cancel a camaLESS form recreating it and calling callback function.
 * @param {string} store Type of color theme.
 * @param {string} form Form object in which enter fields.
 * @param {string} clas CSS class.
 * @param {string} dataType List of themes HTML data-type attribute.
 * @param {function} callback Function to execute after submit.
 * @param {HTMLElement} quickPanel HTMLElement in which insert quickPanel
 * @param {function} quickPanelSettingsAction Function called when settings icon of quickPanel is clicked
 * @returns true
 */
function cancelCamaLessForm(store, form, clas, dataType, callback, quickPanel, quickPanelSettingsAction) {
    // In order to not execute function in onclick assigment return function
    return function() {

        // Form is recreated using database in order to cancel changes
        createCamaLessForm(store, form, clas, dataType, callback, quickPanel, quickPanelSettingsAction);

        if (callback) {
            callback();
        }


        return true;
    };
}

/**
 * Apply camaLESS form submission.
 * @param {string} store Type of color theme.
 * @param {string} form Form object in which enter fields.
 * @param {string} clas CSS class.
 * @param {string} dataType List of themes HTML data-type attribute.
 * @param {function} callback Function to execute after submit.
 * @param {HTMLElement} quickPanel HTMLElement in which insert quickPanel
 * @param {function} quickPanelSettingsAction Function called when settings icon of quickPanel is clicked
 * @returns true
 */
function addToCamaLessForms(store, form, clas, dataType, callback, quickPanel, quickPanelSettingsAction) {
    form.callback = callback;
    form.store = store;
    form.clas = clas;
    form.dataType = dataType;
    form.onsubmit = submitCamaLessForm;
	form.quickPanel = quickPanel;
	form.quickPanelSettingsAction = quickPanelSettingsAction;

    return true;
}

/**
 * Create, update, remove and select color themes of given form.
 * @param {string} form Form object.
 * @param {function} callback Function to execute after submit. If null form callback property is used
 * @param {HTMLElement} quickPanel HTMLElement in which insert quickPanel. if null form quickPanel property is used
 * @param {function} quickPanelSettingsAction Function called when settings icon of quickPanel is clicked.
 * If null form quickPanelSettingsAction property is used
 * @returns false in order to finish pending transactions
 */
function submitCamaLessForm(form, callback, quickPanel, quickPanelSettingsAction) {
    form = form.target;
    if (!callback) {
        callback = form.callback;
    }
	if (!quickPanel) {
		quickPanel = form.quickPanel;
	}
	if (!quickPanelSettingsAction) {
		quickPanelSettingsAction = form.quickPanelSettingsAction;
	}
    var formStores = form.store ? [form.store] : camaLess.stores;

    var formThemes = [];

    // Check that color themes names are not duplicated inside the same type of theme
    // and that there are more than 0 color themes in each type
    var tables = form.querySelectorAll(' .camaLessFormEditPanel table');

    for (var i = 0; i < tables.length; i++) {
        formThemes.push([]);

        var inputs = tables[i].querySelectorAll('input[type="text"]');
		var listTable = form.querySelector('table[data-theme-id="'
				+ tables[i].getAttribute('data-theme-id')
				.replace('FormFields', 'Form') + '"]');
        var selected = listTable.querySelectorAll(' input:checked');

        if (inputs.length === 0 || selected.length === 0) {
            camaLess.almostOneThemeCallback();
            return false;
        }

        var names = [];
        for (var j = 0; j < inputs.length; j++) {
            var name = inputs[j].value;
            if (names.indexOf(name) < 0) {
                names.push(name);

                // Color inputs are in next td to name
                var colors = inputs[j].parentNode.nextSibling.querySelectorAll('.color');
                var values = '{';
                for (var k = 0; k < colors.length; k++) {
                    if (k > 0) {
                        values += ',';
                    }
                    // With '@' and without '[]'
                    values += '"@' + colors[k].name.substring(0, colors[k].name.length - 2);
                    values += '": "' + colors[k].value + '"';
                }
                values += '}';
                values = JSON.parse(values);

				// shownName '' in order to not change user's choice
                formThemes[i].push({name: name,
                    shownName: '', values: values,
                    selected: form.querySelector('[data-theme-id="'
							+ inputs[j].parentNode.parentNode.getAttribute('data-theme-id')
							.replace('themesFieldsTr', 'themesListTr') + '"]')
							.childNodes[0].firstChild.checked ? 1 : 0
				});
            } else {
                camaLess.sameNameThemesCallback(name);
                return false;
            }
        }
    }

    var completed = 0;
    var transactions = [];
	var toAdd = [];
	var added = 0;
	var toRemove = [];
	var removed = 0;
	var toSelect = [];
	var selected = 0;
    for (var i = 0; i < formStores.length; i++) {
		transactions.push(camaLess.camaLessDb.transaction([formStores[i]], 'readonly'));
        // Get camaLessDb themes
        var objectStore = transactions[i].objectStore(formStores[i]);
        var cursor = objectStore.openCursor();
        cursor.onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                toRemove.push({name: cursor.value.name, store: cursor.source.name});
                cursor.continue();
            } else {
                completed++;
            }
			if (completed === formStores.length) {
				for (var j = 0; j < formThemes.length; j++) {
					for (var k = 0; k < formThemes[j].length; k++) {
						toAdd.push({name: formThemes[j][k].name,
							values: formThemes[j][k].values, store: formStores[j]});

						if (formThemes[j][k].selected) {
							toSelect.push({name: formThemes[j][k].name, store: formStores[j]});
						}
					}
				}


				// apply changes sequentially: firstly remove all themes, then create all themes,
				// then select selected theme and lastly apply themes,
				// recreate form and execute callback
				for (var r = 0; r < toRemove.length; r++) {
					var removing = toRemove[r];
					removeColorTheme(removing.name, removing.store,
					function() {
						removed++;

						if (removed === toRemove.length) {
							for (var a = 0; a < toAdd.length; a++) {
								var adding = toAdd[a];
								// New themes has no shownName
								newColorTheme(adding.name, '', adding.values, a, adding.store,
								function() {
									added++;

									if (added === toAdd.length) {
										for (var s = 0; s < toSelect.length; s++) {
											var selecting = toSelect[s];
											selectColorTheme(selecting.name, selecting.store,
											function() {
												selected++;

												if (selected === toSelect.length) {

													// Apply themes in every store
													applyCamaLessColorTheme();

													// Form is recreated in order to apply changes
													createCamaLessForm(form.store, form, form.clas, form.dataType, callback, quickPanel, quickPanelSettingsAction);

													if (callback) {
														callback();
													}
												}
											});
										}
									}
								});
							}
						}
					});
				}
			}
        };
    }


    return false;
}


/**
 * Get current preview color (checked or editing)
 * @param {string} store The store in which applying preview
 * @param {boolean} edit Edit mode or main view
 * @param {form} form The camaLESS form
 * @returns {object} An object with structure 'LESS variable without @': value
 */
function getCurrentPreviewTheme(store, edit, form) {
	var colors = {};
	var themeUl = '';
	if (!edit) {
		var	table = form.querySelector('table[data-theme-id^="tableForm' + store + '"]');
		var radioChecked = table.querySelector('input[name="' + store + '"]:checked');
		themeUl = form.querySelector('tr[data-theme-id="' + radioChecked.parentNode.parentNode
				.getAttribute('data-theme-id').replace('List', 'Fields') + '"] .themeColors ul');
	} else {
		themeUl = form.querySelector('tr.editing .themeColors ul');
	}

	var colorsLis = themeUl.children;

	for (var i = 0; i < colorsLis.length; i++) {
		var li = colorsLis[i];
		var input = li.querySelector('input');
		colors[input.getAttribute('name').replace('[]', '')] = input.value;
	}

	return colors;
}

/**
 * Applies preview to form
 * @param {string} store The store in which applying preview
 * @param {boolean} edit Edit mode or main view
 * @param {form} form The camaLESS form
 * @returns false in order to finish pending transactions
 */
function applyPreview(store, edit, form) {
	// if the store is the main store or applying to edit view,
	// preview is applied to the whole form,
	// else it is applied only to the store table
	var previewStore = camaLess.camaLessDb.transaction(['preview'], 'readonly').objectStore('preview');
	var target = '';
	if (store === camaLess.stores[0] || edit) {
		var sections = form.querySelectorAll('section');
		target = [form];
		for (var i = 0; i < sections.length; i++) {
			target.push(sections[i]);
		}
	} else {
		target = [form.querySelector('table[data-theme-id^="tableForm' + store + '"]')];
	}


	var currentPreview = getCurrentPreviewTheme(store, edit, form);

	previewStore.get(store).onsuccess = function(event) {
		var preview = event.target.result.preview;

		for (var selector in preview) {
			if (selector && preview.hasOwnProperty(selector)) {
				var elements = target;
				if (selector !== 'this') {
					elements = target[0].querySelectorAll(selector);
				}

				if (elements) {
					for (var i = 0; i < elements.length; i++) {
						var el = elements[i];
						var finalStyle = preview[selector];
						for (var variable in currentPreview) {
							finalStyle = finalStyle.replace(new RegExp('@' + variable, 'g'), currentPreview[variable]);
						}

						el.style.cssText = finalStyle;
					}
				}
			}
		}

	};

	// return false in order to finish pending transactions
	return false;
}



/**
 * Apply selected color theme in store applying its colors to variables.
 * @returns true
 */
function applyCamaLessColorTheme() {

	var allVars = {};
	var added = 0;
	camaLess.stores.forEach(function(store) {
		var objectStore = camaLess.camaLessDb.transaction([store], 'readonly').objectStore(store);
		var index = objectStore.index('selected');
		index.get(1).onsuccess = function(event) {
			if (event.target.result && event.target.result.values) {
				for (var attr in event.target.result.values) {
					allVars[attr] = event.target.result.values[attr];
				}
				added++;

				// modifyVars when all variables of all themes are in allVars
				if (added === camaLess.stores.length) {
					if (camaLess.useCssVars) {
						var append = '<style>html {';
						for (var attr in allVars) {
							var variable = attr.replace('@', '--');
							append += variable + ': ' + allVars[attr] + ';';
						}
						append += '}</style>';
						document.querySelector('head').innerHTML += append;
					} else {
						camaLess.less.modifyVars(allVars);
					}
				}
			}
		};
	});


    return true;
}
