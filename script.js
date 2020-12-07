(function ($, window, undefined) {
    'use strict';
    const pluginName = 'giphy';
    const API_KEY = 'RQ2ZyQrikdgHYyxJWhN54qhqDK3I22WW';

    let limitImagePerPage = 24;
    let currentPage = 0;
    let nextOffset = 0;
    let totalPage = 0;

    function Plugin(element, options) {
      this.element = $(element);
      this.options = $.extend({}, $.fn[pluginName].defaults, this.element.data(), options);
      this.init();
    }

    Plugin.prototype = {
      init: function () {
        this.getImages(nextOffset, limitImagePerPage);
        this.initLoadMoreContent();
      },

      getImages: function (offset, limit) {
        const that = this;
        const options = this.options;

        $(options.loadMore).attr('disabled', true);

        $.ajax({
          type: 'GET',
          url: 'http://api.giphy.com/v1/gifs/trending',
          data: {
            api_key: API_KEY,
            limit,
            offset
          },
          error: function (error) {
            alert("something went wrong please try again!");
          },
          success: function (result) {
            if (result && result.meta && result.meta.status === 200) {
              that.renderData(result.data);
              totalPage = Math.round(result.pagination.total_count / limitImagePerPage);
              currentPage = currentPage + 1;
              nextOffset = result.pagination.offset + result.pagination.count;
            }
          }
        }).done(function () {
          $(options.loadMore).attr('disabled', false);
          if (totalPage === currentPage) {
            $(options.loadMore).remove();
          }
        });
      },

      renderData: function (data) {
        const options = this.options;
        const $el = this.element;
        const $content = $el.find(options.content);
        data.forEach((item, index) => {
          $content.append(`
          <div class="col-6 col-sm-6 col-md-4 col-lg-3">
            <div class="giphy-item" id="${item.id}}">
              <a class="giphy-item__link fancybox-show" href="${item.images.original.url}" title="${item.title}">
                <img class="giphy-item__img" src="${item.images.original.url}" alt="${item.title}">
              </a>
              <h4 class="giphy-item__title">${item.title}</h4>
            </div>
          </div>`);
        });
        this.initFancybox();
      },

      initFancybox: function () {
        const options = this.options;
        $(options.classShowFull).fancybox({
          prevEffect: 'none',
          nextEffect: 'none',
          closeBtn: true,
          helpers: {
            title: {
              type: 'inside'
            },
            buttons: {}
          }
        });
      },

      initLoadMoreContent: function () {
        const that = this;
        const options = that.options;

        $(that.element).on("click", options.loadMore, function () {
          that.getImages(nextOffset, limitImagePerPage);
        });
      },

      destroy: function () {
        // remove events
        $.removeData(this.element[0], pluginName);
      }
    };

    $.fn[pluginName] = function (options, params) {
      return this.each(function () {
        var instance = $.data(this, pluginName);
        if (!instance) {
          $.data(this, pluginName, new Plugin(this, options));
        } else if (instance[options]) {
          instance[options](params);
        }
      });
    };

    $.fn[pluginName].defaults = {
      classShowFull: '.fancybox-show',
      content: '[data-giphy-content]',
      loadMore: '[data-load-more]'
    };

    $(function () {
      $('[data-' + pluginName + ']')[pluginName]({
        key: 'custom'
      });
    });

  }(jQuery, window));