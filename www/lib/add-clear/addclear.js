// Author: Stephen Korecky
// Website: http://stephenkorecky.com
// Plugin Website: http://github.com/skorecky/Add-Clear

;(function($, window, document, undefined) {

	// Create the defaults once
	var pluginName = "addClear",
		defaults = {
			closeSymbol: "&#10006;",
			color: "#CCC",
			top: 1,
			right: 4,
			returnFocus: true,
			showOnLoad: true,
			onClear: null,
			hideOnBlur: false,
			resetValue: "",
            size:""
		};

	// The actual plugin constructor
	function Plugin(element, options) {
		this.element = element;

		this.options = $.extend({}, defaults, options);

		this._defaults = defaults;
		this._name = pluginName;

		this.init();
	}

	Plugin.prototype = {

		init: function() {
			var $this = $(this.element),
					me = this,
					options = this.options;

			$this.wrap("<div style='position:relative;display:inherit;' class='add-clear-span'></div>");
			$this.after($("<a name='#clear' style='display: block;'>" + options.closeSymbol + "</a>"));
			$this.next().css({
				color: options.color,
				'text-decoration': 'none',
				//display: 'none',
				'line-height': 1,
				overflow: 'hidden',
				position: 'absolute',
				right: options.right,
				top: options.top,
                'font-size': options.size
			}, this);

			if ($this.val().length >= 1 && options.showOnLoad === true) {
				$this.siblings("a[name='#clear']").show();
			}

			$this.focus(function() {
				if ($(this).val().length >= 1) {
					$(this).siblings("a[name='#clear']").show();
				}
			});

//			$this.blur(function() {
//				var self = this;

//				if (options.hideOnBlur) {
//					setTimeout(function() {
//						$(self).siblings("a[href='#clear']").hide();
//					}, 50);
//				}
//			});

			$this.keyup(function() {
				if ($(this).val().length >= 1) {
					$(this).siblings("a[name='#clear']").show();
				} else {
					//$(this).siblings("a[href='#clear']").hide();
				}
			});


			$this.siblings("a[name='#clear']").click(function (e) {
			    $(this).siblings(me.element).val(options.resetValue);
				//$(this).hide();
				if (options.returnFocus === true) {
					$(this).siblings(me.element).focus();
				}
				if (options.onClear) {
					options.onClear($(this).siblings("input"));
				}
				e.preventDefault();
			});
		}

	};

	$.fn[pluginName] = function(options) {
		return this.each(function() {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName,
					new Plugin(this, options));
			}
		});
	};

})(jQuery, window, document);
