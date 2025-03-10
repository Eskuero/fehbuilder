// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

class Rebspicker {
	constructor(domitem, type, entries, defaultvalue) {
		this.domitem = domitem;
		this.type = type;
		this.setAttribute("disabled", false);

		this.domitem.className = "rebspicker-select";
		// Create the element that always shows
		var preview = document.createElement('div');
		preview.className = "rebspicker" + (this.type == "multiple" ? "multi" : "") + "-preview";
		preview.addEventListener("mousedown", function() {
			event.preventDefault();
		});
		preview.addEventListener("click", function() {
			if (this.dropdown.style.display != "block") {
				this.open();
			} else {
				document.activeElement.blur();
			}
		}.bind(this));
		// Create the current value holder
		var currentvalue = document.createElement('div');
		if (this.type == "multiple") {
			currentvalue.className = "rebspickermulti-current-value";
		}
		preview.appendChild(currentvalue);
		// Create the open/close arrow indicator
		var arrow = document.createElement('div');
		arrow.className = "rebspicker-arrow closed";
		preview.appendChild(arrow);
		this.domitem.appendChild(preview);

		// Create an element for the dropdown
		var dropdown = document.createElement('div');
		dropdown.className = "rebspicker-dropdown";
		this.domitem.appendChild(dropdown);

		// Create the element containing the text input
		var input = document.createElement('div');
		input.className = "rebspicker-search-container";
		var realinput = document.createElement('input');
		realinput.type = "text";
		realinput.addEventListener("blur", function() {
			// If we are focusing on an option don't close
			if (event.relatedTarget ? event.relatedTarget.className.indexOf("rebspicker-option") == -1 : true) {
				this.close();
			}
		}.bind(this));
		realinput.addEventListener("keyup", function() {
			if (event.keyCode == 40) {
				// Go to the first visible sibling
				for (let i = 0; i < this.options.length; i++) {
					 if (this.options[i].style.display != "none") {
						 this.options[i].focus();
						 return;
					 }
				}
			}
			// Normalize the query to upper case and without special chars like tildes
			var query = this.realinput.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
			// Loop all options and hide/unhide matching options
			for (const option of Object.values(this.options)) {
				if (option.innerHTML.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().indexOf(query) != -1 || option.getAttribute("keywords").toUpperCase().indexOf(query) != -1 || query == "") {
					option.style.display = "flex";
				} else {
					option.style.display = "none";
				}
			}
		}.bind(this));
		// When we blur out of input with a new value, a change event is triggered, bubbling to the select, with undesired behaviour.
		realinput.addEventListener("change", function() {
			event.stopPropagation();
		}.bind(this));
		input.appendChild(realinput);
		this.dropdown.appendChild(input);

		this.selectionlist = document.createElement('div');
		this.selectionlist.className = "rebspicker-list";
		var tabindex = 0;
		// Add a list item for each data entry provided
		for (const [tag, data] of Object.entries(entries)) {
			var option = document.createElement('div');
			option.className = "rebspicker-option " + (data["class"] ? data["class"] : "");
			option.innerHTML = data["string"];
			option.tabIndex = tabindex;
			tabindex += 1;
			option.value = tag;
			option.setAttribute("keywords", data["keywords"]);
			option.addEventListener("click", function() {
				// Update selected option
				this.value = event.target.value;
				// Fire the change event
				this.domitem.dispatchEvent(new Event('change'));
				this.close();
			}.bind(this));

			option.addEventListener("mouseover", function() {
				event.target.focus();
			});
			option.addEventListener("blur", function() {
				// If we are focusing on an option don't close
				if (event.relatedTarget ? (event.relatedTarget.className.indexOf("rebspicker-option") == -1 && event.relatedTarget != this.realinput) : true) {
					this.close();
				}
			}.bind(this));

			option.addEventListener("keydown", function() {
				// Get all visible siblings
				var visible = [];
				for (let i = 0; i < this.options.length; i++) {
					 if (this.options[i].style.display != "none") {
						 visible.push(this.options[i]);
					 }
				}
				// Going down
				if (event.keyCode == 40) {
					var newindex = Array.from(visible).indexOf(event.target) + 1;
					if (visible[newindex]) {
						this.selectionlist.scrollTo({"top": visible[newindex].offsetTop - this.selectionlist.getBoundingClientRect().height + visible[newindex].clientHeight, "behavior": "smooth"});
						visible[newindex].focus();
					}
				// Going up
				} else if (event.keyCode == 38) {
					var newindex = Array.from(visible).indexOf(event.target) - 1;
					var nextelement = visible[newindex] ? visible[newindex] : this.realinput;
					if (visible[newindex]) {
						this.selectionlist.scrollTo({"top": nextelement.offsetTop - this.selectionlist.getBoundingClientRect().height / 2, "behavior": "smooth"});
					}
					nextelement.focus();
				// Pressed enter
				} else if (event.keyCode == 13) {
					// Update selected option
					this.value = event.target.value;
					// Fire the change event
					this.domitem.dispatchEvent(new Event('change'));
					this.close();
				// For any other key go back to writting in the input box
				} else {
					this.realinput.focus();
				}
			}.bind(this));
			this.selectionlist.appendChild(option);
		}

		// Change default item
		if (this.type == "single") {
			if (defaultvalue) {
				this.value = defaultvalue;
			} else {
				this.value = this.options[0].value;
			}
		} else {
			defaultvalue = defaultvalue ? defaultvalue : [];
			for (let i = 0; i < defaultvalue.length; i++) {
				if ([...this.options].map(opt => opt.value).includes(defaultvalue[i])) {
					this.value = defaultvalue[i];
				}
			}
		}
	}

	clean() {
		if (this.type == "single") {
			this.value = this.options[0].value;
			this.domitem.dispatchEvent(new Event('change'));
		} else {
			while(this.preview.firstChild.lastChild) {
				this.preview.firstChild.removeChild(this.preview.firstChild.lastChild);
			}
			this.domitem.dispatchEvent(new Event('change'));
		}
	}

	open() {
		// If disabled just skip
		if (this.disabled) {
			return;
		}
		this.dropdown.appendChild(this.selectionlist);
		this.dropdown.style.display = "block";
		this.dropdown.style.zIndex = "100";
		this.realinput.focus();
		this.arrow.className = "rebspicker-arrow opened";
	}
	close() {
		// Skip if already closed skip, because when removing selectionlist item a blur event might trigger (See https://bugzilla.mozilla.org/show_bug.cgi?id=559561)
		if (this.dropdown.style.display == "none") {
			return;
		}
		this.dropdown.style.display = "none";
		this.dropdown.style.zIndex = "auto";
		this.arrow.className = "rebspicker-arrow closed";
		this.dropdown.removeChild(this.selectionlist);
	}
	setAttribute(key, value) {
		this.domitem.setAttribute(key, value);
	}
	getAttribute(key) {
		return this.domitem.getAttribute(key);
	}
	removeChild(item) {
		this.domitem.removeChild(item);
	}

	set value(value) {
		if (this.type == "single") {
			this.preview.firstChild.value = value;
			var stringindex = [...this.options].map(opt => opt.value).indexOf(value);
			this.preview.firstChild.innerHTML = [...this.options].map(opt => opt.innerHTML)[stringindex];
		} else {
			var alreadyselected = this.selectedOptions;
			for (let i = 0; i < alreadyselected.length; i++) {
				// If the selected value is already in the list do not add it
				if (alreadyselected[i].value == value) {
					return false;
				}
			}
			// Create another option
			var selection = document.createElement('div');
			selection.className = "rebspickermulti-selected";
			selection.value = value;
			var stringindex = [...this.options].map(opt => opt.value).indexOf(value);
			selection.innerHTML = [...this.options].map(opt => opt.innerHTML)[stringindex];
			// Create the close button
			var closebutton = document.createElement('div');
			closebutton.className = "rebspickermulti-close-button";
			closebutton.innerHTML = "X";
			closebutton.addEventListener("click", function() {
				selection.parentElement.removeChild(selection);
				this.domitem.dispatchEvent(new Event('change'));
			}.bind(this, selection));
			selection.append(closebutton);
			this.preview.firstChild.append(selection);
		}
		// Set value of the domitem so it can be retrieved upon being the caller of a function
		this.domitem.value = value;
	}
	set disabled(value) {
		if (value) {
			this.domitem.className = "rebspicker-select disabled";
		} else {
			this.domitem.className = "rebspicker-select";
		}
		this.setAttribute("disabled", value);
	}

	get value() {
		if (this.type == "single") {
			return this.preview.firstChild.value;
		} else {
			return this.preview.firstChild.firstChild.value;
		}
	}
	get disabled() {
		return this.getAttribute("disabled") == "true" ? true :  false;
	}
	get selectedOptions() {
		if (this.type == "single") {
			return [this.preview.firstChild];
		} else {
			return this.preview.firstChild.children;
		}
	}
	get style() {
		return this.domitem.style;
	}
	get lastChild() {
		return this.domitem.lastChild;
	}
	get preview() {
		return this.domitem.children[0];
	}
	get arrow() {
		return this.preview.lastChild;
	}
	get dropdown() {
		return this.domitem.children[1];
	}
	get realinput() {
		return this.dropdown.firstChild.firstChild;
	}
	get options() {
		return this.selectionlist.children;
	}
}
