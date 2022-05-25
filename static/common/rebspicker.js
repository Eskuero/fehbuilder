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
	constructor(domitem, type, entries, resizelisteners = [window], scrolllisteners = [window], defaultvalue) {
		this.domitem = domitem;
		this.type = type;

		this.domitem.className = "rebspicker-select";
		// Create the element that always shows
		var preview = document.createElement('div');
		preview.className = "rebspicker" + (this.type == "multiple" ? "multi" : "") + "-preview";
		preview.addEventListener("mousedown", function() {
			event.preventDefault();
		});
		preview.addEventListener("click", function() {
			this.openclose();
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
			var query = this.realinput.value;
			// Loop all options and hide/unhide matching options
			for (const option of Object.values(this.options)) {
				if (option.innerHTML.toUpperCase().indexOf(query.toUpperCase()) != -1 || option.getAttribute("keywords").toUpperCase().indexOf(query.toUpperCase()) != -1 || query == "") {
					option.style.display = "flex";
				} else {
					option.style.display = "none";
				}
			}
		}.bind(this));
		input.appendChild(realinput);
		this.dropdown.appendChild(input);

		var list = document.createElement('div');
		list.className = "rebspicker-list";
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
			option.addEventListener("mousedown", function() {
				event.preventDefault();
			});
			option.addEventListener("click", function() {
				// Update selected option
				this.value = event.target.value;
				// Fire the change event
				this.domitem.dispatchEvent(new Event('change'));
				this.realinput.dispatchEvent(new Event('blur'));
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
			list.appendChild(option);
		}
		this.dropdown.appendChild(list);

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

		// Attach for resize to update dropdown position and do the initial correction
		resizelisteners.forEach(element => {
			element.addEventListener('resize', function() {this.reposition()}.bind(this));
		});
		scrolllisteners.forEach(element => {
			element.addEventListener('scroll', function() {this.reposition()}.bind(this));
		});
		this.reposition();
	}

	reposition() {
		var coordinates = this.domitem.getBoundingClientRect();
		this.dropdown.style.top = coordinates.top + window.scrollY + this.domitem.clientHeight - 4 + "px";
		this.dropdown.style.left = coordinates.left + window.scrollX + "px";
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

	openclose() {
		// Un/hide and Un/focus depending on current state
		if (this.dropdown.style.display == "block") {
			this.close();
		} else {
			this.open();
		}
	}
	open() {
		this.dropdown.style.display = "block";
		this.dropdown.style.zIndex = "100";
		this.realinput.focus();
		this.arrow.className = "rebspicker-arrow opened";
	}
	close() {
		this.dropdown.style.display = "none";
		this.dropdown.style.zIndex = "auto";
		this.arrow.className = "rebspicker-arrow closed";
		document.activeElement.blur();
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
	}
	get value() {
		if (this.type == "single") {
			return this.preview.firstChild.value;
		} else {
			return this.preview.firstChild.firstChild.value;
		}
	}
	get selectedOptions() {
		if (this.type == "single") {
			return [this.preview.firstChild];
		} else {
			return this.preview.firstChild.children;
		}
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
	get selectionlist() {
		return this.dropdown.children[1];
	}
	get options() {
		return this.selectionlist.children;
	}
}
