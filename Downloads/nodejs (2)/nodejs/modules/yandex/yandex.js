/**
 * Функции для работы с Яндекс
 *
 * @package SerpHunt
 * @subpackage Core
 *
 * Mozilla/5.0 (iPhone; CPU iPhone OS 15_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 YaBrowser/22.7.4.658 Mobile/15E148 Safari/604.1
 * Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1
 */

const fs = require( 'fs' );
const request = require( 'request-promise-native' );

class yandex
{
  constructor()
  {
    //this.screen = false;
    this.captchaComments = false;
    this.searchURL = '';
    this.lastSearchPage = null;
    this.resultsNumberIsSetted = false;
    this.resultsPerPage = 50;
    this.searchDepth = 100;
    this.noDelay = true;
    this.services = [];


    this.captchaCheckboxClass = 'CheckboxCaptcha-Button';
    this.captchaCheckboxSelector = '.' + this.captchaCheckboxClass;

    this.captchaSliderClass = 'CaptchaSlider';
    this.captchaSliderSelector = '.' + this.captchaSliderClass;

    this.captchaImageSelector = 'img[src*="/captchaimage"], img[src*="/captchaimg?"], img[src*="captcha.yandex"]';

    this.captchaRegexp = new RegExp( '["\'\/ .](captchaimg\?|captchaimage|captcha\.yandex|' +  this.captchaCheckboxClass + '|' + this.captchaSliderClass + ')' );


    this.waitSelector = '.serp-footer, .SerpFooter, .media-footer, .form__captcha, .footer, .mfooter, .footer2, .RelatedBottom';
    //this.waitSelector = '.serp-footer, .SerpFooter, .media-footer, .form__captcha, .footer, .mfooter, .footer2';
    this.waitSelector = this.captchaCheckboxSelector + ', ' + this.captchaSliderSelector + ', ' + this.waitSelector + ', ' + this.captchaImageSelector;
    this.waitSelector = this.waitSelector + ', #footer'; //директ

    this.currentPage = 1;
    this.captchaNumber = 0;
    this.captchaMax = 20;//20;

    this.searchOperators = {
      indexing_number: php.trim( fs.readFileSync( rootPath + '/data/search-operators/indexing-number-yandex.txt' ).toString() )
    };

    this.region = '';
    this.mainRegion = '';
    this.domain = '.ru';

    this.prevUrllist = [];


    /**
     * Настройка региона по умолчанию
     */
    if ( typeof siteOptions != 'undefined' && siteOptions['yandex'] != undefined )
    {
      for ( var region_key in siteOptions['yandex']['position_regions'] )
      {
        if ( siteOptions['yandex']['position_regions'][region_key]['region_id'] != undefined
              && siteOptions['yandex']['position_regions'][region_key]['is_main'] != undefined
              && php.trim( siteOptions['yandex']['position_regions'][region_key]['is_main'] ) )
        {
          this.mainRegion = region_key;

          if ( siteOptions['yandex']['position_regions'][region_key]['domain'] != undefined
              && php.trim( siteOptions['yandex']['position_regions'][region_key]['domain'] ) )
          {
            this.domain = siteOptions['yandex']['position_regions'][region_key]['domain'];
          }

          break;
        }
      }
    }


    const cookie_domain = '.yandex' + this.domain;
    const yandexuid = new Date().getTime() + '';

    this.cookies = null;
/*
    this.cookies = [
      { name: 'yandexuid', value: yandexuid, domain: cookie_domain, path: '/' }, //при изменении этой куки выдача меняется на нормальную, но не всегда (
                                                                                 //пробовал ее также менять после загрузки результатов первой страницы, с последующей перезагрузкой

      //{ name: 'yp', value: '1707162227.sp.family:0', domain: cookie_domain, path: '/' }, //поиск без ограничений
    ];
*/
  }


  /**
   * Настройк URL поиска
   */
  async setSearchURL( query, region )
  {
    await page.setJavaScriptEnabled( false ); //jstoggle
//console.log( query );

    seoa.captchaSearch = 'yandex';


    if ( this.domain.indexOf( '.' ) < 0 )
    {
      this.domain = '.' + this.domain;
    }


    /**
     * Настрока переменной региона
     */
    if ( region === true )
    {
      region = this.region;
    }
    else if ( region === false )
    {
      region = '';
    }


    if ( /\.ua$/.test( this.domain ) )
    {
      this.domain = '.ru';
      //region = false;

      if ( siteOptions[ 'yandex' ] != undefined
          && siteOptions[ 'yandex' ][ 'position_regions' ][ region ] != undefined
          && siteOptions[ 'yandex' ][ 'position_regions' ][ region ][ 'domain' ] == '.ua' )
      {
        siteOptions[ 'yandex' ]['position_regions' ][ region ][ 'domain' ] = '.ru';
      }
    }


    if ( this.lastSearchPage )
    {
      return true;
    }

    if ( this.cookies == null )
    {
      this.cookies = await page.cookies( 'https://yandex' + this.domain );
    }


    /**
     * Возвращение статуса, сообщающего об остановке выполнения задания,
     * в связи с ошибкой или большим количеством капч
     */
    if ( await this.checkCaptcha() === 'stop' )
    {
      return 'stop';
    }


    /**
     * Задержка запроса
     */
    if ( this.noDelay )
    {
      this.noDelay = false;
    }
    else
    {
      //await seoa.delay( 'yandex', query );
    }


    if ( !this.searchURL.trim() )
    {
      this.searchURL = 'https://yandex' + this.domain + '/search/';
      if ( seoa.device == 'mobile' )
      {
        this.searchURL += 'touch/';
      }

      this.searchURL += '?text=' + encodeURIComponent( query ).replace( /\%20/g, '+' );

      if ( siteOptions['yandex'] != undefined
          && siteOptions['yandex']['position_regions'][region] != undefined )
      {
        var region_data = siteOptions['yandex']['position_regions'][region];

//console.log( region_data );

        if ( php.trim( region_data['region_id'] ) )
        {
          if ( region_data['is_main'] != undefined )
          {
            this.mainRegion = region;
          }

          this.searchURL += '&lr=' + region_data['region_id'];
        }
        else
        {
          this.searchURL += '&lr=0';
        }

        if ( region_data['domain'] != undefined && php.trim( region_data['domain'] ) )
        {
          this.domain = region_data['domain'];

          this.searchURL = this.searchURL.replace(
            /^(https:\/\/(?:www\.)?yandex)\.[^\/\?]+/,
            '$1' + this.domain,
            this.searchURL
          );
        }
      }


      if ( seoa.device == 'mobile' )
      {
        //this.searchURL += '&mda=0';
        this.searchURL += '&search_source=yaru_touch_common';
      }
      else
      {
        this.searchURL += '&search_source=yaru_desktop_common';
      }
    }
    else
    {
      if ( seoa.device == 'mobile' )
      {
        if ( this.searchURL.indexOf( '/search/touch/' ) < 0 )
        {
          this.searchURL = this.searchURL.replace( '/search/', '/search/touch/' );
        }
      }
      else if ( this.searchURL.indexOf( '/search/touch/' ) > -1 )
      {
        this.searchURL = this.searchURL.replace( '/search/touch/', '/search/' );
      }

      this.prevUrllist = [];

      this.searchURL = this.searchURL.replace( '?', '?&' );
      this.searchURL = this.searchURL.replace( /text=[^&]+/, 'text=' + encodeURIComponent( query ).replace( /\%20/g, '+' ) );
      this.searchURL = this.searchURL.replace( /[&\?]p=\d+/, '' );
      this.searchURL = this.searchURL.replace( /[&\?]lr=[^&]*/g, '' );

      if ( siteOptions['yandex'] != undefined
          && siteOptions['yandex']['position_regions'][region] != undefined )
      {
        var region_data = siteOptions['yandex']['position_regions'][region];

        if ( php.trim( region_data['region_id'] ) )
        {
          if ( region_data['is_main'] != undefined )
          {
            this.mainRegion = region;
          }

          this.searchURL += '&lr=' + region_data['region_id'];
        }
        else
        {
          this.searchURL += '&lr=' + region_data['region_id'];
        }

        if ( region_data['domain'] != undefined && php.trim( region_data['domain'] ) )
        {
          this.domain = region_data['domain'];

          this.searchURL = this.searchURL.replace(
            /^(https:\/\/(?:www\.)?yandex)\.[^\/\?]+/,
            '$1' + this.domain,
            this.searchURL
          );
        }
      }

      this.searchURL = this.searchURL.replace( /&+/g, '&' );
    }


    if ( !await seoa.pageLoad( this.searchURL, this.waitSelector ) )
    {
      return 'stop';
    }


    if ( await this.checkIpBlock() )
    {
      return 'stop';
    }


    /**
     * Задержка запроса
     */
    //await seoa.delay( 'yandex', query );


    /**
     * Обновление контрольного времени выполнения задания
     */
    await seoa.updateTaskExecutionTime( 'yandex' );


    /**
     * Возвращение статуса, сообщающего об остановке выполнения задания,
     * в связи с ошибкой или большим количеством капч
     */
    if ( await this.checkCaptcha() === 'stop' )
    {
      return 'stop';
    }


    /**
     * Обновление контрольного времени выполнения задания
     */
    await seoa.updateTaskExecutionTime( 'yandex' );


    /**
     * Обновление контрольного времени выполнения задания
     */
    if ( /^https?:\/\/(www\.)?yandex\./.test( await page.url() ) )
    {
      this.searchURL = await page.url();
    }

    return true;
  }


  /**
   * Обработка результатов поиска
   */
  async getSearchResults( query, region )
  {
    if ( !php.trim( query ) )
    {
      return false;
    }


    region = typeof region !== 'undefined' ?  region : true;


    var url_status = await this.setSearchURL( query, region );
    if ( url_status !== true )
    {
      return url_status;
    }

/*
fs.writeFileSync(
  rootPath + '/_' + md5(  await page.url() ) + '.html',
  JSON.stringify( _post[ 'proxy' ] ) + '\n' +decodeURIComponent( await page.url() ) + '\n' + ( await page.content() )
);
*/


    //не удалять, иначе "ошибка загрузки результатов яндекса для запроса: проверка позиций сайта"
    if ( await this.checkCaptcha() === 'stop' )
    {
      return 'stop';
    }


    var results = await page.evaluate( ( wait_selector, query, yandex_services ) => {

      var results = {};
      var position = 1;

      if ( document.querySelector( wait_selector ) === null )
      {
        return {};
      }

      var $items = document.querySelectorAll( '.serp-item' );
      if ( $items.length > 0 )
      {
        let ads_found = 0;

        topcycle:
        for ( var i = 0; i < $items.length; i++ )
        {
          var itemHTML = $items[ i ].outerHTML.replace( /<noframes[^>]*>.+<\/noframes>/g, '' );
          var stopWords = [
            'z-market',
            'serp-adv__item',
            'fact-layout', //быстрый ответ
            'aria-label="Реклама"',
            '-Text">Промо</',
            'class="Adv',
            'role="complementary"',
            '>Реклама<',
            '//yabs.yandex.'
          ];

          for( var swi = 0; swi < stopWords.length; swi++ )
          {
            if ( itemHTML.indexOf( stopWords[ swi ] ) > -1 )
            {
              ads_found ++;
              continue topcycle;
            }
          }

          var $link = $items[ i ].querySelector( 'a.link, a.Link' );
          if ( $link !== null )
          {
            var pageURL = $link.href;

            if ( /\/\/yabs\.yandex\.[^.\/]+\/count\//.test( pageURL ) && typeof $link.data( 'bem' ) != 'undefined' )
            {
              let urldata = $link.data( 'bem' );
              let url = false;
              if ( typeof urldata.click != 'undefiend' && typeof urldata.click.arguments != 'undefined' && typeof urldata.click.arguments.url != 'undefined' )
              {
                url = urldata.click.arguments.url;
                url = url.replace( /[?&]utm_.+$/g, '' );
                url = url.replace( /[?&]yclid.+$/g, '' );

                pageURL = url;
              }
            }


            let url_matches = /^(?:https:)?\/\/[^\/.]+\.turbopages\.[^\/]+\/([^\/]+)\/s\/([^?]+)/.exec( pageURL )
            if ( url_matches !== null )
            {
              pageURL = 'http://' + url_matches[ 1 ] + '/' + url_matches[ 2 ];
            }
            else if ( /^(https:)?\/\/yandex\.[^\/]+\/turbo\?text=/.test( pageURL ) )
            {
              pageURL = pageURL.replace( /^(https:)?\/\/yandex\.[^\/]+\/turbo\?text=/, '' );
              pageURL = pageURL.replace( /^([^&?]+)\&.*$/, '$1' );
              pageURL = decodeURIComponent( pageURL );
            }
            else if ( /^(https:)?\/\/yandex\.[^\/]+\/turbo\/.+/.test( pageURL ) )
            {
              pageURL = pageURL.replace( /^(https:)?\/\/yandex\.[^\/]+\/turbo\//, '' );
              pageURL = pageURL.replace( /^([^\/]+)\/s\//, '$1/' );
              pageURL = pageURL.replace( '/n/yandexturbolisting/', '/' );
              pageURL = pageURL.replace( /\?sign=.+$/, '' );

              if ( !/^(https:)?\/\//.test( pageURL ) )
              {
                pageURL = 'http://' + pageURL.replace( /^(https:)?\/\//, '' );
              }
            }
            else if ( /^\/safety\/\?url=/.test( pageURL ) )
            {
              pageURL = pageURL.replace( /^\/safety\/\?url=/, '' );
              pageURL = decodeURIComponent( pageURL );
            }

            if ( !/(^|\()\s*url\:/i.test( query )
                  && ( /(\/|\.)yandex\./.test( pageURL ) || /(images|video)\.yandex/.test( itemHTML ) ) )
            {
              let allowed = false;

              if ( yandex_services.length > 0 )
              {
                for ( let i in yandex_services )
                {
                  if ( pageURL.indexOf( yandex_services[ i ] ) > -1 )
                  {
                    allowed = true;
                    break;
                  }
                }
              }

              if ( !allowed )
              {
                continue;
              }
            }
          }
          else
          {
            continue;
          }

          let $title = $items[ i ].querySelector( 'h2.OrganicTitle-LinkText, h2.serp-item__title, h2.organic__title-wrapper' )
          if ( $title !== null )
          {
            $title = $title.querySelector( 'span.OrganicTitleContentSpan, a' );
          }

          if ( $title !== null )
          {
            const $favicon = $title.querySelector( '.favicon' )
            if ( $favicon !== null )
            {
              $favicon.remove();
            }

            var title = $title.innerHTML.trim();

            title = title.replace( /<br[^>]*>/g, ' ' );
            title = title.replace( /<b[^>]*>/g, '{{kstrong}}' );
            title = title.replace( /<\/b>/g, '{{/kstrong}}' );

            title = title.replace( /<[^>]*>/g, '', );

            title = title.replace( /\{\{kstrong\}\}/g, '<span class="kstrong">' );
            title = title.replace( /\{\{\/kstrong\}\}/g, '</span>' );

            title = title.replace( /\s+/g, ' ', );
            title = title.trim();
          }
          else
          {
            var title = null;
          }

          let $description = $items[ i ].querySelector( '.OrganicText, .organic__content-wrapper div.extended-text__full, .organic__content-wrapper > div, .text' );
          if ( $description !== null )
          {
            var description = $description.innerHTML.trim();
            description = description.replace( /<br[^>]*>/g, ' ' );
            description = description.replace( /<b[^>]*>/g, '{{kstrong}}' );
            description = description.replace( /<\/b>/g, '{{/kstrong}}' );
            description = description.replace( /<span[^>]+extended-text__toggle[^>]+>.*?<\/span>.*$/g, '' );
            description = description.replace( /<[^>]*>/g, '', )
            description = description.replace( /\{\{kstrong\}\}/g, '<span class="kstrong">' );
            description = description.replace( /\{\{\/kstrong\}\}/g, '</span>' );
            description = description.replace( /\s+/g, ' ', );
            description = description.trim();
          }
          else
          {
            var description = null;
          }

          var $cacheLink = $items[ i ].querySelector( 'a[href*="hghltd.yandex.net/yandbtm?"]' );
          if ( $cacheLink !== null )
          {
            var cacheURL = $cacheLink.href;
          }
          else
          {
            var cacheURL = null;
          }

          var domain = /^(?:https?:)?(?:\/\/)?(?:(?:www|m)\.)?([^\/\?]+)/.exec( pageURL );
          if ( domain != null )
          {
            domain = domain[ 1 ];
          }
          else
          {
            domain = pageURL;
          }

          results[ position ] = {
            'site': domain.toLowerCase(),
            'page_url': pageURL,
            'title': title,
            'description': description,
            'cache_url': cacheURL
          };

          position++;
        }

        if ( document.querySelector( 'form[action*="/search"]' ) !== null && Object.keys( results ).length < 1 )
        {
          // на некоторых прокси яндекс не до конца загружает данные,
          // поэтому проверяется наличее сообщения, о том, что данные не найдены
          if ( ads_found
                || document.querySelector( '.EmptySearchResults' ) !== null
                || ( document.querySelector( '.misspell__message' ) !== null && document.querySelector( '.misspell__button' ) === null )
              )
          {
            results[ -1 ] = {
              'site': null,
              'page_url': null,
              'title': null,
              'description' : null,
              'cache_url': null
            };
          }
        }
      }
      else if ( document.querySelector( 'form[action*="/search"]' ) !== null )
      {
        // на некоторых прокси, яндекс не загружает данные,
        // поэтому проверяется наличее сообщения, о том, что данные не найдены
        if ( document.querySelector( '.EmptySearchResults' ) !== null
              || document.querySelector( '.misspell__message' ) !== null && document.querySelector( '.misspell__button' ) === null )
        {
          results[ -1 ] = {
            'site': null,
            'page_url': null,
            'title': null,
            'description' : null,
            'cache_url': null
          };
        }
      }

      return results;
    }, this.waitSelector, query, this.services );



    if ( Object.keys( results ).length > 0 )
    {
      let urllist = [];
      let matches_number = 0;

      for ( let i in results )
      {
        if ( php.inArray( results[ i ][ 'page_url' ], this.prevUrllist ) )
        {
          matches_number ++;
        }

        urllist.push( results[ i ][ 'page_url' ] );
      }

      this.prevUrllist = urllist;

//console.log( matches_number );

      //if ( matches_number > 2 || ( matches_number >= 1 && Object.keys( results ).length <= 3 ) )
      if ( matches_number >= 5 )
      {
        results = {
          '-1' : {
            'site': null,
            'page_url': null,
            'title': null,
            'description' : null,
            'cache_url': null
          }
        };
      }

      return results;
    }
    else
    {
      const exceptions = [
        'курсы по таргетированной рекламе',
        '"/termostaticheskaya-golovka-heizen-dlya-radiatornogo-klapana-m30x1-5-tl-5"'
      ];

      if ( php.inArray( query, exceptions ) && this.region.indexOf( 'desktop' ) > -1 )
      {
        results[ -1 ] = {
          'site': null,
          'page_url': null,
          'title': null,
          'description' : null,
          'cache_url': null
        };

        return results;
      }

/*
fs.writeFileSync(
  rootPath + '/_errors/empty-results/' + md5( query ) + '.html',

  + await page.url()
  + '\n'
  + seoa.device
  + '\n'
  + JSON.stringify( _post[ 'proxy' ] )
  + '\n'
  + await page.content()
);
*/

console.log( 'yandex=403' );
process.exit();

      console.log( 'ошибка загрузки результатов яндекса для запроса: ' + query );
      return 'stop';
    }
  }


  /**
   * Поиск URL следующей страницы поиска
   */
  async nextPage( resultsNumber )
  {
    await page.setJavaScriptEnabled( false ); //jstoggle

    //if ( resultsNumber < this.searchDepth * 0.91 )
    if ( resultsNumber < this.searchDepth * 0.91 )
    {
//await page.waitForTimeout( 3000 );

      if ( await this.checkCaptcha() == 'stop' )
      {
        return 'stop';
      }

      //if ( await page.url().indexOf( '/showcaptcha?' ) > -1 || this.captchaRegexp.test( seoa.pageContent() ) )
      //if ( await page.url().indexOf( '/showcaptcha?' ) > -1 )
      if ( this.captchaRegexp.test( seoa.pageContent() ) )
      {
        return 'stop';
      }


      let current_url = await page.url();

      if ( /[?&]text=/.test( current_url ) && !/text=(site|url|info)\%3A/.test( current_url ) )
      {
        if ( this.lastSearchPage )
        {
          current_url = this.lastSearchPage;
        }

        const currentPage = /[?&]p=(\d+)(&|$)/.exec( current_url );
        let nextPage = 1;

        if ( currentPage !== null )
        {
          nextPage = currentPage[ 1 ] * 1 + 1;
        }

        let next_url = current_url.replace( /&p=[^?&]+/g, '' )
        //next_url = next_url.replace( /&(search_source|redircnt|rnd|msid|suggest_reqid)=[^?&]+/g, '' );
        next_url = next_url.replace( /&(search_source|redircnt|rnd|msid)=[^?&]+/g, '' );
        next_url += '&p=' + nextPage;

        const rnd = /[&;]rnd=([^ &"\']+)/.exec( seoa.pageContent() );
        if ( rnd !== null )
        {
          next_url += '&rnd=' + rnd[ 1 ];
        }

        const msid = /[&;]msid=([^ &"\']+)/.exec( seoa.pageContent() );
        if ( msid !== null )
        {
          next_url += '&msid=' + msid[ 1 ];
        }
        else
        {
          const reqid = /"reqid":"([^"]+)"/.exec( seoa.pageContent() );
          if ( reqid !== null )
          {
            next_url += '&msid=' + reqid[ 1 ];
          }
        }

        const suggest_reqid = /[&;]suggest_reqid=([^ &"\']+)/.exec( seoa.pageContent() );
        if ( suggest_reqid !== null )
        {
          next_url += '&suggest_reqid=' + suggest_reqid[ 1 ];
        }

//console.log( nextPage );
//fs.writeFileSync( rootPath + '/_errors/page.html', seoa.pageContent() );
//return false;

        if ( await seoa.pageLoad( next_url, this.waitSelector ) )
        {
          if ( await this.checkCaptcha() === 'stop' )
          {
            return 'stop';
          }


          this.lastSearchPage = next_url;


          try
          {
            const pagination_type = await this.checkSerpItems();
            return pagination_type;
          }
          catch ( error )
          {
            error = error.toString();

            if ( error.indexOf( 'net::ERR_HTTP_RESPONSE_CODE_FAILURE' ) > -1 )
            {
              return false;
            }
            else if ( error.indexOf( 'Execution context was destroyed, most likely because of a navigation' ) > -1 )
            {
              await page.waitForTimeout( 300 );

              if ( await this.checkCaptcha() == 'stop' )
              {
                return 'stop';
              }

              //if ( await page.url().indexOf( '/showcaptcha?' ) > -1 || this.captchaRegexp.test( seoa.pageContent() ) )
              //if ( this.captchaRegexp.test( seoa.pageContent() ) )
              if ( this.captchaRegexp.test( seoa.pageContent() ) )
              {
                return 'stop';
              }

              return await this.checkSerpItems();
            }
            else
            {
              console.log( '' );
              console.log( 'NEXT PAGE ERROR' );
              console.log( error );
              console.log( '' );

              return 'stop';
            }
            //await seoa.pageLoad( nextPage, this.waitSelector );
          }
        }
        else
        {
          return false;
        }
      }
      else
      {
        return false;
      }
    }

    return false;
  }



  /**
   * Проверка наличия выдачи
   */
  async checkSerpItems()
  {
/*
    if ( await page.url().indexOf( '/showcaptcha?' ) > - 1 && await this.checkCaptcha() === 'stop' )
    {
      return 'stop';
    }
*/

/*
    let serpitems = await page.evaluate( () => {
      return document.querySelectorAll( '.serp-item' ).length;
    });
*/
    let serpitems = seoa.pageContent().split( /["\' ]serp\-item/g ).length;
    let i = 0;

    while ( serpitems == 0 && i <= 20 )
    {
      await page.waitForTimeout( 100 );

      let serpitems = seoa.pageContent().split( /["\' ]serp\-item/g ).length;
/*
      serpitems = await page.evaluate( () => {
        return document.querySelectorAll( '.serp-item' ).length;
      });
*/

      i++;
    }

    if ( serpitems > 0 )
    {
      return 'ajax';
    }
    else
    {
      return false;
    }
  }



  /**
   * Количество проиндексированных страниц сайта
   */
  async getNumberOfPagesIndexed( site )
  {
    if ( typeof site != 'undefined' )
    {
      var query = this.searchOperators['indexing_number'].replace( '{domain}', php.trim( site ) );
      var url_status = await this.setSearchURL( query, false );
      if ( url_status !== true )
      {
        return url_status;
      }
    }


    return await page.evaluate( () => {
      if ( document.querySelector( '.serp-adv__found' ) !== null )
      {
        var indexedPages = document.querySelector( '.serp-adv__found' ).innerHTML;
        indexedPages = indexedPages.replace(/&nbsp;/g, ' ');
        indexedPages = indexedPages.replace( /<[^>]*>/g, '' )
        indexedPages = indexedPages.replace( /\s+/g, ' ' );
        indexedPages = indexedPages.trim();

        indexedPages = indexedPages.replace( /\s+тыс/, '000' )
        indexedPages = indexedPages.replace( /\s+млн/, '000000' );

        indexedPages = indexedPages.replace( /\D+/g, '' ) * 1;
      }
      else
      {
        var indexedPages = 0;
      }

      return indexedPages;
    });
  }



  /**
   * Проверка на капчу
   */
  async checkCaptcha( oneword, iteration )
  {
    //if ( await page.url().indexOf( '/showcaptcha?' ) < 0 && !this.captchaRegexp.test( seoa.pageContent() ) )
    if ( await page.url().indexOf( '/showcaptcha?' ) < 0 && !this.captchaRegexp.test( await page.content() ) )
    {
      return false;
    }

//seoaOptions[ 'captcha_solving' ][ 'services' ][ 'captcha.guru' ][ 'status_yandex_advanced' ] = 0;
//seoaOptions[ 'captcha_solving' ][ 'services' ][ 'server' ][ 'status_yandex_advanced' ] = 1;


    if ( typeof iteration == 'undefined' )
    {
      iteration = 1;
    }
    else
    {
      iteration += 1;
    }


    if ( iteration >= 5 )
    {
      console.log( 'captcha iteration ' + iteration );

      console.log( '' );
      console.log( seoa.device );
      console.log( seoa.userAgent );
      const dimensions = await page.evaluate(() => {
        return {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight,
          deviceScaleFactor: window.devicePixelRatio
        };
      });
      console.log( dimensions );
      console.log( '' );

      process.exit();

      //console.log( 'TimeoutError: Navigation Timeout Exceeded: 30000ms exceeded X4' );
      //process.exit();

      //console.log( 'yandex=403' );
      //process.exit();

      return 'stop';
    }


    if ( php.inArray( 'server', captchaSolver.blockedServices ) )
    {
      //iteration = 100;
    }


    if ( seoa.device == 'mobile' )
    {
      //this.captchaMax = 30;
    }


    const wait_selector = this.waitSelector.replace( this.captchaCheckboxSelector + ', ' + this.captchaSliderSelector, '' );
    let js_enabled = false;

const time_start = new Date().getTime();

    /**
     * Smart Captcha
     */
    if ( seoa.pageContent().indexOf( this.captchaCheckboxClass ) > -1 )
    {
      seoa._pageContent = '';

      if ( _post.handler != 'keywords-frequency' )
      {
        js_enabled = true;
        await page.setJavaScriptEnabled( true ); //jstoggle
      }

/*
      const $captcha_checkbox = await page.$( '#js-button' );
      if ( $captcha_checkbox )
      {
        const cached_url = await page.url();
        const checkbox_offset = await $captcha_checkbox.boundingBox();

        await page.mouse.move( checkbox_offset[ 'x' ] + 5, checkbox_offset[ 'y' ] + 5 );
        await page.mouse.down();
        await page.waitForTimeout( 50 );
        await page.mouse.up();

        const t1 = new Date().getTime();

        try
        {
          let ci = 0;
          while ( await page.url() == cached_url && ci <= 2000 )
          {
            await page.waitForTimeout( 100 );
            ci++;
          }
        }
        catch ( error )
        {
console.log( 'checkbox error 1: ' + error );
        }

        if ( await page.url() != cached_url )
        {
          console.log( '\n\nyandex checkbox captcha is solved: ' + ( Math.round( ( new Date().getTime() - t1 ) / 1000 ) ) + ' seconds\n\n' );
        }
        else
        {
          console.log( '\n\nyandex checkbox captcha not solved: ' + ( Math.round( ( new Date().getTime() - t1 ) / 1000 ) ) + ' seconds\n\n' );
          return 'stop';
        }
      }
*/


      await page.evaluate( () => {
        var $form_captcha = document.querySelector( 'form[action*="/checkcaptcha?"]' );
        $form_captcha.submit();
      } );

      await page.waitForTimeout( 100 );

      await seoa.finishPageLoading( wait_selector );
    }



    for ( let sli = 1; sli <= 1; sli ++ )
    {
      /**
       * Slider Captcha
       */
      try
      {
        var $captcha_slider = await page.$( this.captchaSliderSelector );
      }
      catch ( error )
      {
        await page.waitForTimeout( 1000 );
        var $captcha_slider = await page.$( this.captchaSliderSelector );
      }

      try
      {
        //if ( seoa.pageContent().indexOf( this.CaptchaSliderClass ) > -1 )
        if ( seoa.pageContent().indexOf( this.CaptchaSliderClass ) > -1 || $captcha_slider != null )
        //if ( $captcha_slider != null )
        {
console.log( '\nyandex slider not solver\n' );
return 'stop';
          console.log( '\nyandex slider captcha: step ' + sli + '\n\n' );

          if ( sli > 1 )
          {
            await page.reload();
          }

          if ( seoaOptions[ 'captcha_solving' ][ 'services' ][ 'captcha.guru' ][ 'status_yandex_slider' ] > 0 )
          {
            const solving_options = { 'source' : 'yandex_slider' };
            const page_content = await page.evaluate( () => { return window.btoa( document.documentElement.outerHTML.replace( /[а-яёЁ]/gi, 'X' ) ); } );
            const steps = await captchaSolver.start( 'slider', page_content, solving_options );

            if ( /^[0-9]+$/.test( steps ) )
            {
              for ( let i = 1; i <= steps; i ++ )
              {
                const $button = await page.$( '.ControlButtons-Container .CaptchaButton_size_s' );
                if ( $button !== null )
                {
                  await $button.click();
                  await page.waitForTimeout( sli * 200 );
                }
                else
                {
                  console.log( 'не найден селектор slider капчи .CaptchaButton_size_s' );
                  return 'stop';
                }
              }

              const $button = await page.$( '.CaptchaSlider .Track .Background' );
              if ( $button !== null )
              {
                await $button.click();

                for ( let x = 1; x <= 40; x ++ )
                {
                  await page.waitForTimeout( 500 );
                  const $captcha_slider = await page.$( this.captchaSliderSelector );

                  if ( $captcha_slider === null )
                  {
                    break;
                  }
                }
              }
              else
              {
                console.log( 'не найден селектор slider капчи .Track' );
                return 'stop';
              }
            }
            else
            {
              console.log( 'не числовой ответ решения slider капчи: ' + steps );
              return 'stop';
            }
          }
          else
          {
            return 'stop';
          }
  /*
          seoa._pageContent = '';

          const t1 = new Date().getTime();

          js_enabled = true;
          /*
           * //jstoggle
           * /
          await page.setJavaScriptEnabled( true );
          await page.reload();
          await page.waitForTimeout( 500 );
          await seoa.finishPageLoading( wait_selector );
          //* /

          $captcha_slider = await page.$( '.CaptchaSlider' );
          if ( $captcha_slider )
          {
            const cached_url = await page.url();
            const slider_offset = await $captcha_slider.boundingBox();

            const start_point = {
              'x' : slider_offset[ 'x' ] + 15,
              'y' : slider_offset[ 'y' ] + 15
            };

            const end_point = {
              'x' : slider_offset[ 'x' ]  + slider_offset[ 'width' ] - 5,
              'y' : slider_offset[ 'y' ] + slider_offset[ 'height' ] - 5
            };


            await page.mouse.move( start_point[ 'x' ], start_point[ 'y' ] );
            await page.mouse.down();
            await page.waitForTimeout( 50 );
            await page.mouse.move( end_point[ 'x' ], end_point[ 'y' ] );
            await page.waitForTimeout( 50 );
            await page.mouse.up();

            try
            {
              let ci = 0;
              //while ( await page.url() == cached_url && ci <= 60 )
              while ( await page.url() == cached_url && ci <= 900 )
              {
                await page.waitForTimeout( 100 );
                ci++;
              }
            }
            catch ( error )
            {
  console.log( 'slider error 1: ' + error );
            }

            if ( await page.url() != cached_url )
            {
              console.log( '\n\nyandex slider captcha is solved: ' + ( Math.round( ( new Date().getTime() - t1 ) / 1000 ) ) + ' seconds\n\n' );
            }
            else
            {
              console.log( '\n\nyandex slider captcha not solved: ' + ( Math.round( ( new Date().getTime() - t1 ) / 1000 ) ) + ' seconds\n\n' );
              return 'stop';
            }
          }
  */
        }
        else
        {
          break;
        }
      }
      catch ( error )
      {
  console.log( 'slider error 2: ' + error );
      }
    }


    /**
     * Slider Captcha
     */
    try
    {
      var $captcha_slider = await page.$( this.captchaSliderSelector );
    }
    catch ( error )
    {
      await page.waitForTimeout( 1000 );
      var $captcha_slider = await page.$( this.captchaSliderSelector );
    }

    try
    {
      //if ( seoa.pageContent().indexOf( this.CaptchaSliderClass ) > -1 )
      if ( seoa.pageContent().indexOf( this.CaptchaSliderClass ) > -1 || $captcha_slider != null )
      {
        console.log( '\nyandex slider not solver\n' );
        return 'stop';
      }
    }
    catch ( error )
    {
      console.log( '\nyandex slider not solver: ' + error + '\n' );
      return 'stop';
    }



    let captcha_image = null;

    for ( let i = 0; i <= 20; i ++ )
    {
      const page_content = await page.content();
      captcha_image = /imageSrc:"([^"]+)"/.exec( page_content );
      if ( captcha_image )
      {
        captcha_image = captcha_image[ 1 ];

        await page.evaluate( ( catpcha_selector ) => {
          const $captcha = document.querySelectorAll( catpcha_selector );
          for ( let i in $captcha )
          {
            if ( typeof $captcha[ i ].style != 'undefined' && ( typeof $captcha[ i ].style.display == 'undefined' || $captcha[ i ].style.display != 'none' ) )
            {
              $captcha[ i ].id = 'unicaptcha';

              if ( $captcha[ i ].complete )
              {
                unicaptcha_image_loaded = true;
              }

              $captcha[ i ].onload = function()
              {
                unicaptcha_image_loaded = true;
              }
            }
          }
        }, this.captchaImageSelector );
      }
      else
      {
        captcha_image = await page.evaluate( ( catpcha_selector ) => {
          const $captcha = document.querySelectorAll( catpcha_selector );
          for ( let i in $captcha )
          {
            //if ( typeof  $captcha[ i ].src != 'undefined'
            if ( typeof $captcha[ i ].style != 'undefined' && ( typeof $captcha[ i ].style.display == 'undefined' || $captcha[ i ].style.display != 'none' ) )
            {
              $captcha[ i ].id = 'unicaptcha';

              if ( $captcha[ i ].complete )
              {
                unicaptcha_image_loaded = true;
              }

              $captcha[ i ].onload = function()
              {
                unicaptcha_image_loaded = true;
              }

              //setTimeout( function() { unicaptcha_image_loaded = true; }, 1000 );

              return $captcha[ i ].src;
            }
          }
        }, this.captchaImageSelector );
      }

      if ( await page.$( '#checkbox-captcha-form' ) && !captcha_image )
      {
        await page.waitForTimeout( 100 );
      }
      else
      {
        break;
      }
    }



    if ( captcha_image )
    {
      //перезагрузка страницы с включенным js, если до этого не была обнаружена Smart Captcha
      if ( !js_enabled && !php.inArray( _post.handler, [ 'keywords-frequency', 'cookies-yandex' ] ) )
      {
        /*
         * //jstoggle
         */
        await page.setJavaScriptEnabled( true );
        await page.reload();
        //*/

        captcha_image = await page.evaluate( ( catpcha_selector ) => {
          const $captcha = document.querySelectorAll( catpcha_selector );
          for ( let i in $captcha )
          {
            if ( typeof $captcha[ i ].style != 'undefined' && ( typeof $captcha[ i ].style.display == 'undefined' || $captcha[ i ].style.display != 'none' ) )
            {
              $captcha[ i ].id = 'unicaptcha';

              if ( $captcha[ i ].complete )
              {
                unicaptcha_image_loaded = true;
              }

              $captcha[ i ].onload = function()
              {
                unicaptcha_image_loaded = true;
              }

              return $captcha[ i ].src;
            }
          }
        }, this.captchaImageSelector );
      }

/*
      if ( captcha_image )
      {
        let captcha_path = rootPath + '/_errors/captcha'  + '/' + php.strPad( new Date().getHours(), 2, '0', 'STR_PAD_LEFT' );

        if( !fs.existsSync( captcha_path ) )
        {
          seoa.mkdirRecursive( captcha_path );
        }
//console.log( captcha_image );
        fs.writeFileSync(
          captcha_path + '/' +  md5( captcha_image ) + '.jpg',
          await request.get( { 'url': captcha_image, encoding: null } )
        );
      }
*/


/*
let $advanced_captcha1 = await page.$( '.AdvancedCaptcha_silhouette' );
captcha_image = await $advanced_captcha1.screenshot({ encoding: "base64" });
const captcha_offset = await $advanced_captcha1.boundingBox();
const x = captcha_offset[ 'x' ] + 50.1;
const y = captcha_offset[ 'y' ] + 50.2;

console.log( x + ' / ' + y );

//await page.mouse.move( x, y );
//await page.mouse.down();
              await page.mouse.click( x, y );

const x1 = captcha_offset[ 'x' ] + 100.5;
const y1 = captcha_offset[ 'y' ] + 100.5;

await page.mouse.click( x1, y1 );
//const $captcha = await page.$( '#unicaptcha' );
//await $captcha.click();
//await page.mouse.up();

return 'stop';
*/


      this.captchaNumber ++;
      if ( this.captchaNumber > this.captchaMax )
      {
        return 'stop';
      }




      if ( _post.handler == 'keywords-frequency' )
      {
        captchaNumbers.authorization += 1;
      }
      else
      {
        captchaNumbers.parsing += 1;
      }


      if ( this.captchaComments )
      {
        await console.log( 'yandex captcha: start solving' );
      }


      /**
       * Настройки распознавания
       */
      var solving_options = { source: 'yandex' };
      if ( typeof oneword  != 'undefined' )
      {
        solving_options[ 'oneword' ] = true;
      }

/*
      try // если раскомментировать полявляется бесконечная капча
      {
*/
        /**
         * Поиск продвинутой капчи
         */

        //https://docs.cap.guru/ru/apiclick/smartcap.html
        captchaSolver.forceService = false;
        const $advanced_captcha = await page.$( '.AdvancedCaptcha_silhouette' );
        let $captcha_button = null;

        if ( $advanced_captcha !== null )
        {
          let unicaptcha_loaded = false;
          //for ( let i = 0; i < 120; i ++ )
          for ( let i = 0; i < 300; i ++ )
          {
  //console.log( i );
            let unicaptcha_image_loaded = await page.evaluate( () => {
              if ( typeof unicaptcha_image_loaded != 'undefined' )
              {
                return true;
              }
            });

            if ( unicaptcha_image_loaded  )
            {
              unicaptcha_loaded = true;
              //console.log( 'unicaptcha_image_loaded' );

              break;
            }

            await page.waitForTimeout( 100 );
          }

          if ( !unicaptcha_loaded )
          {
            console.log( 'не удалось загрузить изображения продвинутой яндекс капчи' );
            return 'stop';
          }

          await page.waitForTimeout( 1000 ); //без этого много ошибок ERROR_CAPTCHA_UNSOLVABLE, при 3000 получше

          solving_options[ 'source' ] = 'yandex_advanced';


          if ( php.inArray( 'server', captchaSolver.blockedServices ) )
          {
            //iteration = 1;
          }

          if (
              ( !php.inArray( 'server', captchaSolver.blockedServices )
                && typeof seoaOptions[ 'captcha_solving' ][ 'services' ][ 'server' ] != 'undefined'
                && seoaOptions[ 'captcha_solving' ][ 'services' ][ 'server' ][ 'status_yandex_advanced' ] > 0 )
              ||
              ( typeof seoaOptions[ 'captcha_solving' ][ 'services' ][ 'capsola.cloud' ] != 'undefined'
                && seoaOptions[ 'captcha_solving' ][ 'services' ][ 'capsola.cloud' ][ 'status_yandex_advanced' ] > 0 )
              ||
              ( typeof seoaOptions[ 'captcha_solving' ][ 'services' ][ 'white-captcha.com' ] != 'undefined'
                && seoaOptions[ 'captcha_solving' ][ 'services' ][ 'white-captcha.com' ][ 'status_yandex_advanced' ] > 0 )
            )
          {
            const image_url_captcha = await page.evaluate( () => {
              const $unicaptcha = document.querySelector( '.AdvancedCaptcha-ImageWrapper img' );
              if ( $unicaptcha !== null )
              {
                return $unicaptcha.src;
              }
            });

            if ( !image_url_captcha )
            {
              console.log( 'НЕ НАЙДЕНО ИЗОБРАЖЕНИЕ КАПЧИ В ПРОДВИНУТОЙ КАПЧИ ЯНДЕКСА' );
              return 'stop';
            }


  /*
            const image_url_task = await page.evaluate( () => {
              const $unicaptcha_task = document.querySelector( '.AdvancedCaptcha-SilhouetteTask canvas, .AdvancedCaptcha-CanvasContainer canvas' );
              if ( $unicaptcha_task !== null )
              {
                return $unicaptcha_task.src;
              }
            });

            if ( !image_url_task )
            {
              console.log( 'НЕ НАЙДЕНО ИЗОБРАЖЕНИЕ ЗАДАНИЯ В ПРОДВИНУТОЙ КАПЧИ ЯНДЕКСА' );
              return 'stop';
            }
  */

            const $captcha_image = await page.$( '.AdvancedCaptcha-ImageWrapper img' );
            const $catpcha_task = await page.$( '.AdvancedCaptcha-SilhouetteTask canvas, .AdvancedCaptcha-CanvasContainer canvas' );

  /*
            //captcha_image = await request.get({ 'url': image_url_captcha });
            captcha_image = await $captcha_image.screenshot();
            fs.writeFileSync( 'D:/captcha.png', captcha_image );

            captcha_image = await $catpcha_task.screenshot();
            fs.writeFileSync( 'D:/captcha_task.png', captcha_image );
  */


            let task_image = await page.evaluate( () => {
              const taskselectors = [
                '.AdvancedCaptcha-SilhouetteTask canvas',
                '.AdvancedCaptcha-CanvasContainer canvas',
                '.AdvancedCaptcha-SilhouetteTask img',
                '.AdvancedCaptcha-CanvasContainer img'
              ].join( ',' );

              const $unicaptcha_task = document.querySelector( taskselectors );
              if ( $unicaptcha_task !== null )
              {
  /*
                $unicaptcha_task.style.minWidth = '480px';
                $unicaptcha_task.style.minHeight = '80px';
                $unicaptcha_task.style.position = 'relative';
                $unicaptcha_task.style.zIndex = '9999999';
                $unicaptcha_task.style.background = '#FFF';
                return true;
  */

                //проблемы с доступом в яндекс браузере

                //$unicaptcha_task.setAttribute( 'crossOrigin', 'Anonymous' );
                //$unicaptcha_task.crossOrigin = 'Anonymous';

                const $AdvancedCaptcha = document.querySelector( '.AdvancedCaptcha' );
                $AdvancedCaptcha.style.position = 'fixed';
                $AdvancedCaptcha.style.left = 0;
                $AdvancedCaptcha.style.top = 0;
                $AdvancedCaptcha.style.padding = 0;
                $AdvancedCaptcha.style.margin = 0;
                $AdvancedCaptcha.style.minWidth = '320px';
                $AdvancedCaptcha.style.maxWidth = '320px';

                const $ImageWrapper = document.querySelector( '.AdvancedCaptcha-ImageWrapper' );
                $ImageWrapper.style.width = '320px';
                $ImageWrapper.style.minWidth = '320px';
                $ImageWrapper.style.maxWidth = '320px';

                const $captchaImg = document.querySelector( '.AdvancedCaptcha-ImageWrapper img' );
                $captchaImg.style.width = '320px';
                $captchaImg.style.minWidth = '320px';
                $captchaImg.style.maxWidth = '320px';


                if ( typeof $unicaptcha_task.src != 'undefined' )
                {
                  const canvas = document.createElement("canvas");
                  canvas.width = $unicaptcha_task.naturalWidth;
                  canvas.height = $unicaptcha_task.naturalHeight;

                  const context = canvas.getContext( "2d" );

                  context.fillStyle = '#fff';
                  context.fillRect( 0, 0, canvas.width, canvas.height );

                  context.drawImage( $unicaptcha_task, 0, 0 );

                  var image_encoded = canvas.toDataURL("image/png");
                }
                else
                {
                  const context = $unicaptcha_task.getContext('2d');
                  const w = $unicaptcha_task.width;
                  const h = $unicaptcha_task.height;
                  const data = context.getImageData(0, 0, w, h);
                  const compositeOperation = context.globalCompositeOperation;

                  context.globalCompositeOperation = 'destination-over';
                  context.fillStyle = '#fff';
                  context.fillRect( 0, 0, w, h );

                  var image_encoded = $unicaptcha_task.toDataURL("image/png");
                }

                return image_encoded.replace( 'data:image/png;base64,', '' );
              }
              else
              {
                return false;
              }
            });

  //return 'stop';

            if ( !task_image )
            {
  //            console.log( 'yandex captcha - task image not loaded' );
  //            return 'stop';

  console.log( 'reload yandex page - task image' );
              await page.reload();
              await page.waitForTimeout( 1 * 1000 );

              if ( await this.checkCaptcha( undefined, iteration ) === 'stop' )
              {
  console.log( 'TimeoutError: Navigation Timeout Exceeded: 30000ms exceeded XX' );
  process.exit();
                 return 'stop';
              }
              else
              {
                return true;
              }

              //return 'stop';
            }


//console.log( await page.url() );

            captcha_image = {
              //'captcha' : await request.get({ 'url': image_url_captcha, 'encoding': 'base64' }),
              'captcha' : await $captcha_image.screenshot({ encoding: "base64" }),
              'task' : task_image,
              //'task' : await $catpcha_task.screenshot({ encoding: "base64" }),
            };


/*
var captcha_path = 'D:/';
fs.writeFileSync( captcha_path + '/captcha.png', captcha_image[ 'captcha' ] );
fs.writeFileSync( captcha_path + '/task.png', captcha_image[ 'task' ] );
*/


/*
const captcha_path = rootPath + '/_errors/captcha/base64/' + md5( await page.url() );
seoa.mkdirRecursive(  captcha_path );

fs.writeFileSync( captcha_path + '/captcha.png', captcha_image[ 'captcha' ] );
fs.writeFileSync( captcha_path + '/task.png', captcha_image[ 'task' ] );
*/
          }
          else if ( seoaOptions[ 'captcha_solving' ][ 'services' ][ 'captcha.guru' ][ 'status_yandex_advanced' ] )
          {
            //await page.waitForTimeout( 3000 );
  /*
            await page.evaluate( () => {
              const $unicaptcha_task = document.querySelector( '.AdvancedCaptcha-SilhouetteTask canvas, .AdvancedCaptcha-CanvasContainer canvas' );
              if ( $unicaptcha_task !== null )
              {
                if ( $unicaptcha_task.complete )
                {
                  unicaptcha_task_loaded = true;
                }

                $unicaptcha_task.onload = function()
                {
                  unicaptcha_task_loaded = true;
                }
              }
            });

            let unicaptcha_loaded = false;
            for ( let i = 0; i < 50; i ++ )
            {
    //console.log( i );
              let unicaptcha_image_loaded = await page.evaluate( () => {
                if ( typeof unicaptcha_image_loaded != 'undefined' )
                {
                  return true;
                }
              });

             let unicaptcha_task_loaded = await page.evaluate( () => {
                if ( typeof unicaptcha_task_loaded != 'undefined' )
                {
                  return true;
                }
              });

              if ( unicaptcha_image_loaded && unicaptcha_task_loaded )
              {
                unicaptcha_loaded = true;
                //console.log( 'unicaptcha_image_loaded' );

                break;
              }

              await page.waitForTimeout( 100 );
            }

            if ( !unicaptcha_loaded )
            {
              console.log( 'не удалось загрузить изображения продвинутой яндекс капчи' );
              return 'stop';
            }
  */


            const task_image_found = await page.evaluate( () => {
              const $unicaptcha_task = document.querySelector( '.AdvancedCaptcha-SilhouetteTask canvas, .AdvancedCaptcha-CanvasContainer canvas' );
              if ( $unicaptcha_task !== null )
              {
                return true;
              }
              else
              {
                return false;
              }
            });


            if ( task_image_found )
            {
              //captchaSolver.forceService = 'captcha.guru';
              captcha_image = await $advanced_captcha.screenshot({ encoding: "base64" });

              //fs.writeFileSync( 'D:/captcha.png', await $advanced_captcha.screenshot() );

              captcha_image = 'base64:' + captcha_image;
            }
            else
            {

              console.log( 'reload yandex page - task image' );

              await page.reload();
              await page.waitForTimeout( 1 * 1000 );

              if ( await this.checkCaptcha( undefined, iteration ) === 'stop' )
              {
                console.log( 'TimeoutError: Navigation Timeout Exceeded: 30000ms exceeded XX' );
                process.exit();

                return 'stop';
              }
              else
              {
                return true;
              }
            }
          }
          else
          {
            return 'stop';
          }

  /*
          fs.writeFileSync(
            rootPath + '/_errors/captcha/' + md5( captcha_image ) + '.png',
            Uint8Array.from( atob( captcha_image ), (m) => m.codePointAt(0) )
          );
  */

          $captcha_button = await page.$( '.CaptchaButton_view_action' );

  //console.log( 'ЯНДЕКС - ПРОДВИНУТАЯ КАПЧА' );

          if ( $captcha_button === null )
          {
            console.log( 'не найдено кнопки для отправки "advanced captcha" для яндекса' );
            return 'stop';
          }
        }
        else
        {
  //console.log( 'ЯНДЕКС - ОБЫЧНАЯ КАПЧА' );
        }
/*
      }
      catch( error )
      {

      }
*/



//fs.writeFileSync( rootPath + '/_errors/captcha-number.txt', '1\n', { 'flag' : 'a+' } );

/*
if ( fs.existsSync( rootPath + '/captcha-yandex-number.txt' ) )
{
  var captcha_number = fs.readFileSync( rootPath + '/captcha-yandex-number.txt' ) * 1 + 1;
}
else
{
  var captcha_number = 1;
}
fs.writeFileSync( rootPath + '/captcha-yandex-number.txt', captcha_number + '' );
*/


//console.log( 'прогрузка капч: ' + ( Math.round( ( new Date().getTime() - time_start ) / 1000 ) ) );

//const t1 = new Date().getTime();
      const captchaCode = await captchaSolver.start( 'image', captcha_image, solving_options );
//console.log( '\ncaptcha solver time: ' + Math.round( ( new Date().getTime() - t1 ) / 1000 ) + '\n' );


      if ( typeof captchaCode != 'undefined' && await php.trim( captchaCode ) )
      {
        if ( this.captchaComments )
        {
          console.log( 'yandex captcha: ' + captchaCode );
        }

        seoa._pageContent = '';

        var cached_url = await page.url();

        try
        {
          if ( $advanced_captcha !== null )
          {
//coordinates:X1=1,Y1=1;X2=2,Y2=2;Xn=3,Yn=3
            if ( captchaCode.indexOf( 'coordinates:' ) > -1 )
            {
              const captcha_offset = await $advanced_captcha.boundingBox();

//console.log( captcha_offset );

              let coordinates = captchaCode.replace( 'coordinates:', '' );
              coordinates = coordinates.split( ';' );
              for ( let i in coordinates )
              {
                coordinates[ i ] = coordinates[ i ].split( ',' );

                const click_offset = {
                  'x' : coordinates[ i ][ 0 ].replace( /x\d*=/i, '' ) * 1,
                  'y' : coordinates[ i ][ 1 ].replace( /y\d*=/i, '' ) * 1,
                };

//console.log( click_offset );

                const x = captcha_offset[ 'x' ] + click_offset[ 'x' ] + 1 + 15; //10
                const y = captcha_offset[ 'y' ] + click_offset[ 'y' ] + 1 + 15; //10

//console.log( x + ' / ' + y );

                //await page.mouse.click( x, y );
                await page.touchscreen.tap( x, y );
/*
                await page.mouse.move( x, y );
                await page.mouse.down();
                await page.waitForTimeout( 50 );
                await page.mouse.up();
                //await page.waitForTimeout( 1000 );
*/
              }

//await page.waitForTimeout( 3000 );
              await page.mouse.move( 0, 0 );

//console.log( this.region );
//console.log( _post[ 'proxy' ] );
//await page.waitForTimeout( 200000 );

//return 'stop';

              $captcha_button = await page.$( '.CaptchaButton_view_action' );
              if ( $captcha_button )
              {
                const button_offset = await $captcha_button.boundingBox();
                await page.mouse.move( button_offset[ 'x' ] + 5, button_offset[ 'y' ] + 5 );
                await page.mouse.down();
                await page.waitForTimeout( 50 );
                await page.mouse.up();
              }

              //await $captcha_button.click();
              //await seoa.mouseClick( '.CaptchaButton_view_action' );
            }
            else
            {
              console.log( 'не найдены координаты продвинутой капчи яндекса в ответе сервиса распознавания капчи: ' + captchaCode );
              return 'stop';
            }
          }
          else
          {
            const captchaInputSelector = '#rep,input[name="captcha_code"],input[name="rep"],input[name="captcha_answer"]';

            const $input = await page.$( captchaInputSelector );
            if ( $input !== null )
            {
              await page.focus( captchaInputSelector );
              await page.hover( captchaInputSelector );
              await page.click( captchaInputSelector );
              await page.keyboard.type( captchaCode );

              await page.evaluate( ( captchaInputSelector, captchaCode ) => {
                const $captchaInput = document.querySelector( captchaInputSelector );

                if ( $captchaInput !== null )
                {
                  const $captchaForm = $captchaInput.closest( 'form' );
                  const $captchaSubmitButton = $captchaForm.querySelector( 'button[type="submit"]' );

                  if ( !$captchaInput.value.trim() )
                  {
                    $captchaInput.value = captchaCode;
                  }

                  if ( $captchaSubmitButton !== null )
                  {
                    $captchaSubmitButton.click();
                  }
                  else
                  {
                    $captchaForm.submit();
                  }
                }
              }, captchaInputSelector, captchaCode );
            }
            else
            {
              console.log( 'не найдено поле ввода капчи' );
              process.exit();
            }
          }

          let ci = 0;
          //while ( await page.url() == cached_url && ci <= 60 )
          while ( await page.url() == cached_url && ci <= 100 )
          {
            await page.waitForTimeout( 100 );
            ci++;
          }

          await seoa.finishPageLoading( wait_selector );
        }
        catch( error )
        {

        }


        if ( await page.url().indexOf( '/showcaptcha?' ) > -1 )
        {

//fs.writeFileSync( rootPath + '/_errors/captcha-wrong.txt', '1\n', { 'flag' : 'a+' } );

/*
if ( fs.existsSync( rootPath + '/captcha-yandex-error.txt' ) )
{
  var captcha_error = fs.readFileSync( rootPath + '/captcha-yandex-error.txt' ) * 1 + 1;
}
else
{
  var captcha_error = 1;
}
fs.writeFileSync( rootPath + '/captcha-yandex-error.txt', captcha_error + '' );
*/



/*
при продвинутой капчи неактуально
          try
          {
            const captcha_image_reload = await page.evaluate( ( catpcha_selector, captcha_image_current ) => {
              const $captcha = document.querySelectorAll( catpcha_selector );
              for ( let i in $captcha )
              {
                if ( $captcha[ i ].style.display != 'none' && captcha_image_current != $captcha[ i ].src )
                {
                  return $captcha[ i ].src;
                }
              }

              return true;
            }, this.captchaImageSelector, captcha_image );


            if ( false && captcha_image_reload )
            {
                seoa._pageContent = '';
                await page.reload();
                await page.waitForTimeout( 3 * 1000 );
            }
          }
          catch( error )
          {

          }
*/


          if ( await this.checkCaptcha( undefined, iteration ) === 'stop' )
          {
console.log( 'TimeoutError: Navigation Timeout Exceeded: 30000ms exceeded X1' );
process.exit();
             return 'stop';
          }
        }



        if ( await page.url().indexOf( '/showcaptcha?' ) > -1 )
        {
          return 'stop';
        }
        else
        {
          let i = 0;
          do
          {
            await page.waitForTimeout( 100 );
            i++;

            try
            {
              var selector_is_found = await page.evaluate( ( wait_selector ) => {
                return document.querySelector( wait_selector );
              }, this.waitSelector );
            }
            catch( error )
            {

            }
          }
          //while ( selector_is_found === null && i <= 20 );
          while ( selector_is_found === null && i <= 100 );

          if ( selector_is_found === null )
          {
console.log( 'TimeoutError: Navigation Timeout Exceeded: 30000ms exceeded X2' );
process.exit();
            return 'stop';
          }
        }

        if ( await this.checkIpBlock() )
        {
          return 'stop';
        }
      }
      else if ( $advanced_captcha !== null )
      {
/*
        captcha_image = captcha_image.replace( 'base64:', '' );

        fs.writeFileSync(
          rootPath + '/_errors/captcha/' + md5( captcha_image ) + '.png',
          Uint8Array.from( atob( captcha_image ), (m) => m.codePointAt(0) )
        );
*/

        console.log( 'Пустой "captchaCode". Перезагрузка страницы "advanced captcha" для яндекса' );

        seoa._pageContent = '';

        await page.reload();
        await page.waitForTimeout( 3 * 1000 );

        if ( await this.checkCaptcha( undefined, iteration ) === 'stop' )
        {
console.log( 'TimeoutError: Navigation Timeout Exceeded: 30000ms exceeded X3' );
process.exit();
          return 'stop';
        }
      }
      else
      {
        return 'stop';
      }

      if ( this.captchaComments )
      {
        await console.log( 'yandex captcha: end solving' );
      }
    }

    return true;
  }


  /**
   * Проверка на необходмость ввода телефона
   */
  async checkСontrolAnswerInput()
  {
    if ( await page.$('input[name="question"]' ) !== null )
    {
      if ( await php.trim( _post[ 'account' ][ 'control_answer' ] ) )
      {
        if ( await seoa.fillTextInput( 'input[name="question"]', _post[ 'account' ][ 'control_answer' ] ) )
        {
          await page.waitForTimeout( 1000 ); //не удалять, иначе ошибки

          //'.Button2_type_submit span'
          //'.Button2-Text'
          if ( await seoa.mouseClick( 'form [type="submit"]', 1000 ) )
          {
            if ( await this.checkCaptcha() === 'stop' )
            {
              return { 'error' : 'ошибка авторизации: капча не распознана' };
              process.exit();
            }

            if ( await this.checkIpBlock() )
            {
              process.exit();
            }
          }
          else
          {
            process.exit();
          }
        }
        else
        {
          process.exit();
        }
      }
      else
      {
        console.log( 'авторизация в яндекс: не задан ответ на контрольный вопрос' );
        process.exit();
      }
    }
  }


  /**
   * Проверка на необходмость ввода телефона
   */
  async checkPhoneControlInput()
  {
    return true;
    if ( await php.trim( _post['account']['phone'] ) )
    {
      if ( await page.$('.request-phone_approve-button') !== null )
      {
        await page.evaluate( ( phone ) => {
          if ( document.getElementById( 'phoneNumber' ) != null )
          {
            document.querySelector( '.request-phone_back-button button' ).click();
          }
          else
          {
            document.querySelector('.request-phone_approve-button button').click();
          }
        }, _post['account']['phone'] );

        await page.waitForTimeout( 2000 );
      }
      else if ( await page.$('.control_challenge-phone') !== null )
      {
        await page.evaluate( ( phone ) => {
          var $phoneInput = document.querySelector('.control_challenge-phone');

          if ( $phoneInput !== null )
          {
            $phoneInput.value = phone;
            $phoneInput.closest('form').submit();
          }
        }, _post['account']['phone'] );

        await page.waitForTimeout( 4000 );
      }

      if ( await this.checkIpBlock() )
      {
        process.exit();
      }
    }
  }


  /**
   * Проверка на необходмость ввода дополнительного email
   */
  async checkAdditionalEmailInput()
  {
    const page_url = await page.url();
    if ( /^https:\/\/sso\.(ya|passport\.yandex)\.ru/.test( page_url ) && page_url.indexOf( 'https%3A%2F%2Fdirect.yandex.ru%2Fregistered%2Fmain.pl' ) > -1 )
    {
      await page.waitForTimeout( 2000 );
    }
    else if ( !/^https:\/\/direct\.yandex\.ru\/registered\/main.\pl/.test( page_url ) )
    {
      if ( await page.$('.request-email_back-button') !== null )
      {
        await page.click( '.request-email_back-button' );
        await page.waitForTimeout( 2000 );

        if ( await this.checkIpBlock() )
        {
          process.exit();
        }
      }
    }
  }



  /**
   * Запись cookies
   */
  async writeCookies()
  {
    //if ( _post[ 'handler' ] == 'cookies-yandex' && typeof _post[ 'cookies_dir' ] != 'undefined' )
    //{
      const pagelist = {
        'passport' : 'https://passport.yandex.ru',
        //'direct' : 'https://direct.yandex.ru/registered/main.pl?cmd=advancedForecast',
        //'wordstat' : 'https://wordstat.yandex.ru'
      }

      for ( let pk in pagelist )
      {
        if ( pk == 'wordstat' )
        {
          await seoa.pageLoad( pagelist[ pk ], 'div' );
        }

  //console.log( k );

        let cookies_str = [];
        let cookies = await page.cookies( pagelist[ pk ] );

/*
        for ( let pi in cookies )
        {
          cookies_str.push( cookies[ pi ][ 'name' ] + '=' + cookies[ pi ][ 'value' ] );
        }

        if ( cookies_str.length > 0 )
        {
          //fs.writeFileSync( rootPath + '/_errors/direct-3.html', await page.content() );
          //fs.writeFileSync( _post[ 'cookies_dir' ] + '/' + pk, cookies_str.join( ';' ) );
          fs.writeFileSync( 'D:/' + pk, cookies_str.join( ';' ) );
        }
*/
        fs.writeFileSync( _post[ 'cookies_dir' ] + '/start', JSON.stringify( cookies ) );
        //console.log( this.cookies );
      }
    //}
  }
   //*/



  async fillPassword()
  {
    await seoa.fillTextInput( 'input[name="passwd"]', _post[ 'account' ][ 'password' ] );

    const action = await page.evaluate( ( account, domain ) => {

      if ( document.querySelector( '#passp\\:sign-in' ) !== null )
      {
        return {
          selector: '#passp\\:sign-in',
          action: 'click'
        };
      }
      else if ( document.querySelector('.passport-Domik-Form') !== null )
      {
        return {
          selector: '.passport-Domik-Form',
          action: 'submit'
        };
      }
      else if ( document.querySelector( 'form[action*="passport.yandex' + domain + '/auth"]' ) )
      {
        return {
          selector: 'form[action*="passport.yandex' + domain + '/auth"]',
          action: 'submit'
        };
      }
      else if ( document.querySelector('.domik-submit button') !== null )
      {
        return {
          selector: '.domik-submit button',
          action: 'click'
        };
      }
      else if ( document.querySelector('.domik-submit') !== null )
      {
        return {
          selector: '.domik-submit',
          action: 'click'
        };
      }
    }, _post.account, this.domain );


    if ( typeof action == 'object' )
    {
      await seoa.action( action[ 'action' ], action[ 'selector' ], '.footer, .footer__links, .AuthFooter' );
      await page.waitForTimeout( 4000 );
/*
      const page_url = await page.url();
      if ( /^https:\/\/sso\.(ya|passport\.yandex)\.ru/.test( page_url ) || page_url.indexOf( 'https%3A%2F%2Fdirect.yandex.ru%2Fregistered%2Fmain.pl' ) > -1 )
      {
        //await page.waitForTimeout( 2000 ); //мало
        await page.waitForTimeout( 2500 );
      }
*/
    }
  }


  /**
   * Авторизация в Яндексе
   */
  async auth( retpath, multilogin )
  {

//this.screen = true;

    if ( _post.account != undefined && _post.account.user != undefined && _post.account.password != undefined )
    {
      var check_user_str = _post.account.user.replace(/\@yandex\.\w+/, '');
      var loginRegexp = new RegExp( "([\"\']|\&quot;)" + php.pregQuote( check_user_str ) + "([\"\']|\&quot;)", 'i' );

      const authurl = 'https://passport.yandex' + this.domain + '/auth/add/login?origin=yandex&retpath=' + encodeURIComponent( retpath );
      //const authurl = 'https://passport.yandex' + this.domain + '/auth?origin=yandex&retpath=' + encodeURIComponent( retpath );
      ////const authurl = 'https://passport.yandex' + this.domain + '/auth/welcome?origin=yandex&retpath=' + encodeURIComponent( retpath );

      this.waitSelector += ',.AuthFooter-mainBlock';

      if ( !await seoa.pageLoad( authurl, '.AuthFooter-mainBlock' + ',' + this.captchaCheckboxSelector + ',' + this.captchaSliderSelector + ',' + this.captchaImageSelector ) )
      {
        console.log( 'ошибка загрузки страницы авторизации' );
        return { 'error' : 'ошибка загрузки страницы авторизации' };
      }


      if ( await this.checkCaptcha() === 'stop' )
      {
        //return { 'error' : 'ошибка авторизации <b>' + _post.account.user + ':' + _post.account.password + '</b>' };
        return { 'error' : 'ошибка авторизации: капча не распознана' };
      }

      if ( await this.checkIpBlock() )
      {
        process.exit();
      }


      if ( _post.account.cookies != undefined && _post.account.cookies.trim() )
      {
        const cookies = JSON.parse( _post.account.cookies );
        await page.setCookie( ...cookies );
        await page.reload();
        await page.waitForTimeout( 1000 ); //мало
      }


      if ( typeof multilogin == 'undefined' )
      {
        multilogin = false;
      }

      var login_exists = await page.evaluate( ( account, domain, multilogin ) => {
        $acclist = document.querySelectorAll( 'span.passp-account-list-item__login, .AuthAccountList-itemBlock' );

        if ( $acclist.length > 0 )
        {
          for( let i = 0; i < $acclist.length; i ++ )
          {
            if ( multilogin || $acclist[ i ].innerText.indexOf( account.user ) > -1 )
            {
              if ( $acclist[ i ].closest( '.passp-account-list-item__inner, .AuthAccountListItem-inner' ) != null )
              {
                $acclist[ i ].closest( '.passp-account-list-item__inner, .AuthAccountListItem-inner' ).id = 'seoa-login';
                return 'seoa-login';
              }
              else if ( $acclist[ i ].querySelector( '.passp-account-list-item__inner, .AuthAccountListItem-inner' ) != null )
              {
                $acclist[ i ].querySelector( '.passp-account-list-item__inner, .AuthAccountListItem-inner' ).id = 'seoa-login';
                return 'seoa-login';
              }
            }
          }

          return true;
        }
      }, _post.account, this.domain, multilogin );


      if ( await this.checkCaptcha() === 'stop' )
      {
        //return { 'error' : 'ошибка авторизации <b>' + _post.account.user + ':' + _post.account.password + '</b>' };
        return { 'error' : 'ошибка авторизации: капча не распознана' };
      }


      var retpath_regexp = new RegExp( '^' + retpath );

      if ( login_exists )
      {
        if ( login_exists == 'seoa-login' )
        {
          let cached_url = await page.url();

          await page.focus( '#seoa-login' );
          await page.hover( '#seoa-login' );
          await page.click( '#seoa-login' );

          //await page.waitForTimeout( 500 ); //мало
          //await page.waitForTimeout( 1500 ); //мало
          //await page.waitForTimeout( 2500 ); //мало
          //await page.waitForTimeout( 4000 ); //необходимо, чтобы загрузились данные uid и login, зависит от скорости прокси


          for ( let i = 0; i < 300; i ++ )
          {
            let current_url = await page.url();

            if ( current_url == cached_url || /^https:\/\/sso\./.test( current_url ) )
            {
              await page.waitForTimeout( 100 );
              i++;
            }
            else
            {
              break;
            }
          }


          if ( await page.url().indexOf( '/list?origin=yandex&retpath=https%3A%2F%2Fdirect.yandex.' ) > - 1 )
          {
            cached_url = await page.url();

            for ( let i = 0; i < 30; i ++ )
            {
              let current_url = await page.url();

              if ( current_url == cached_url || /^https:\/\/sso\./.test( current_url ) )
              {
                await page.waitForTimeout( 100 );
                i++;
              }
              else
              {
                break;
              }
            }
          }


          /**
           * Проверка на подтверждения телефона по SMS
           */
          var account_blocked = await this.checkAccountBlock();
          if ( account_blocked )
          {
            return account_blocked;
          }


          if ( await page.$( 'input[name="passwd"]' ) === null )
          {
            if ( retpath_regexp.test( await page.url() ) || retpath == await page.url() )
            {
              if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
              {
                await this.writeCookies();
              }

              return true;
            }
            else if ( /^https:\/\/direct\.yandex\.ru\/registered\/main.\pl/.test( await page.url() ) )
            {
              if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
              {
                await this.writeCookies();
              }

              return true;
            }
            else
            {
              const pageContent = await page.evaluate( () => { return document.documentElement.outerHTML; } );

              if ( await loginRegexp.test( pageContent )
                    || ( multilogin && ( pageContent.indexOf( '"ulogin":"' ) > -1 || ( pageContent.indexOf( '"uid":"' ) > -1 && pageContent.indexOf( '"login":"' ) > -1 ) ) ) )
              {
                if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
                {
                  await this.writeCookies();
                }

                return true;
              }
              else if ( await page.url().indexOf( '/promo/direct/main/' ) > -1 )
              {
                if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
                {
                  await this.writeCookies();
                }

                return true;
              }
            }
          }
        }
        else
        {
          var cookies = await page.cookies( 'https://passport.yandex' + this.domain );
          for ( let i = 1; i < cookies.length; i ++ )
          {
            await page.deleteCookie( cookies[ i ] );
          }

          var cookies = await page.cookies( 'https://passport.yandex' + this.domain );
          var output_link = false;
          if ( cookies.length > 0 )
          {
            output_link = await page.evaluate( ( account, domain ) => {
              var $output_link = document.querySelector( '.AuthAccountListItem-removeButton' );

              if ( $output_link.length !== null )
              {
                return $output_link.getAttribute( 'url' );
              }

              return false;
            });
          }

          if ( output_link )
          {
            if ( !/^https?/.test( output_link ) )
            {
              output_link = 'https:' + output_link;
            }

            await seoa.pageLoad( output_link );
          }
          else
          {
            await page.reload();
          }
        }
      }
      else if ( retpath_regexp.test( await page.url() ) )
      {
        if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
        {
          await this.writeCookies();
        }

        return true;
      }
      else
      {
        //await page.waitForTimeout( 1500 ); //мало
        await page.waitForTimeout( 4000 ); //необходимо, чтобы загрузились данные uid и login
/*
        const page_url = await page.url();
        if ( /^https:\/\/sso\.(ya|passport\.yandex)\.ru/.test( page_url ) )
        {
          await page.waitForTimeout( 2500 );
        }
*/
        var pageContent = await page.evaluate( () => { return document.documentElement.outerHTML; } );
        if ( await loginRegexp.test( pageContent )
              || ( multilogin && ( pageContent.indexOf( '"ulogin":"' ) > -1 || ( pageContent.indexOf( '"uid":"' ) > -1 && pageContent.indexOf( '"login":"' ) > -1 ) ) ) )
        {
          if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
          {
            await this.writeCookies();
          }

          return true;
        }
        else if ( retpath_regexp.test( await page.url() ) )
        {
          if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
          {
            await this.writeCookies();
          }

          return true;
        }
        else if ( await page.url().indexOf( '/promo/direct/main/' ) > -1 )
        {
          if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
          {
            await this.writeCookies();
          }

          return true;
        }
      }


      if ( await this.checkCaptcha() === 'stop' )
      {
        //return { 'error' : 'ошибка авторизации <b>' + _post.account.user + ':' + _post.account.password + '</b>' };
        return { 'error' : 'ошибка авторизации: капча не распознана' };
      }


      /**
       * Заполнение и отсылка формы авторизации,
       * если существует второй шаг
       */
      for ( let i = 1; i <= 2; i ++ )
      {
        let action = 'not found';
        let login_entered = false;

        if ( await page.$( 'a.AuthAccountListItem_default' ) !== null )
        {
          await seoa.mouseClick( 'a.AuthAccountListItem_default', 100 );
          login_entered = true;

          if ( /^https:\/\/direct\.yandex\.ru\/registered\/main.\pl/.test( await page.url() ) )
          {
            if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
            {
              await this.writeCookies();
            }

            return true;
          }
        }
        else if ( await page.$( '.CurrentAccount-displayName' ) !== null )
        {
          const v = await page.evaluate( () => {
            return document.querySelector( '.CurrentAccount-displayName' ).innerHTML;
          } );

          if ( v == _post[ 'account' ][ 'user' ] )
          {
            login_entered = true;
          }
        }
        else if ( await page.$( 'button[data-type="login"]' ) !== null )
        {
          //клик по табу чтобы отображалось поле ввода email вместо телефона
          await seoa.mouseClick( 'button[data-type="login"]', 100 );
        }



//https://passport.yandex.ru/auth/restore/password?origin=yandex&retpath=https%3A%2F%2Fdirect.yandex.ru%2Fregistered%2Fmain.pl%3Fcmd%3DadvancedForecast&login=isadorseedsbm&login=isadorseedsbm&login=isadorseedsbm

        /**
         * Проверка на подтверждения телефона по SMS
         */
        var account_blocked = await this.checkAccountBlock();
        if ( account_blocked )
        {
          return account_blocked;
        }


        const cached_url = await page.url();
        if ( login_entered || await seoa.fillTextInput( 'input[name="login"]', _post[ 'account' ][ 'user' ] ) )
        {

          await this.fillPassword();

          const page_content = await page.content();
//<div class="Field-link" data-t="field:link-login" id="field:link-login"><a data-t="link:default" href="/auth/restore/password?origin=yandex&amp;retpath=https%3A%2F%2Fdirect.yandex.ru%2Fregistered%2Fmain.pl%3Fcmd%3DadvancedForecast&amp;login=isadorseedsbm" weight="medium" class="Link Link_pseudo Link_view_default Link_weight_medium">Восстановить доступ</a></div>
          //let restore_url = exec( page_content );
/*
          if ( page_content.indexOf( 'Восстановить доступ' ) > -1 )
          {
            console.log( 'xxxxxxxxxxxxxx' );
            return stop;
          }

fs.writeFileSync( 'D:/content.html',  await page.content() );
*/
          if ( await page.$( 'a[href*="/auth/restore/password"]' ) !== null  )
          {
            await seoa.mouseClick( 'a[href*="/auth/restore/password"]', 100 );

            await page.waitForTimeout( 2000 );

            if ( await this.checkCaptcha() === 'stop' )
            {
              //return { 'error' : 'ошибка авторизации <b>' + _post.account.user + ':' + _post.account.password + '</b>' };
              return { 'error' : 'ошибка авторизации: капча не распознана' };
            }

            if ( await page.$( '#passp-field-login' ) !== null  )
            {
              await seoa.fillTextInput( '#passp-field-login', _post[ 'account' ][ 'user' ] );

              await page.evaluate( () => {
                const $resotre_form = document.querySelector( '.auth-restore-pass-form' );
                $resotre_form.submit();
              } );

              await page.waitForTimeout( 2000 );

              if ( await this.checkCaptcha() === 'stop' )
              {
                return { 'error' : 'ошибка авторизации: капча не распознана' };
              }
            }


            const answerInputSelector = 'input[name="answer"]';
            if ( await page.$( answerInputSelector ) !== null )
            {
              if ( await php.trim( _post[ 'account' ][ 'control_answer' ] ) )
              {
                await page.focus( answerInputSelector );
                await page.hover( answerInputSelector );
                await page.click( answerInputSelector );

                await page.keyboard.type( _post[ 'account' ][ 'control_answer' ] );

                await page.evaluate( ( answerInputSelector, controlAnswer ) => {
                  const $controlInput = document.querySelector( answerInputSelector );

                  if ( $controlInput !== null )
                  {
                    const $answerForm = $controlInput.closest( 'form' );
                    const $answerSubmitButton = $answerForm.querySelector( 'button[type="submit"]' );

                    if ( !$controlInput.value.trim() )
                    {
                      $controlInput.value = controlAnswer;
                    }

                    if ( $answerSubmitButton !== null )
                    {
                      $answerSubmitButton.click();
                    }
                    else
                    {
                      $answerForm.submit();
                    }
                  }
                }, answerInputSelector, _post[ 'account' ][ 'control_answer' ] );



                await page.waitForTimeout( 2000 );


                const passwordInputSelector = 'input[name="password"]';
                const confirmInputSelector = 'input[name="password_confirm"]';
                const newPassword = _post[ 'account' ][ 'password' ] + '1';


                if ( await page.$( passwordInputSelector ) !== null &&  await page.$( confirmInputSelector ) !== null )
                {
                  await page.focus( passwordInputSelector );
                  await page.hover( passwordInputSelector );
                  await page.click( passwordInputSelector );

                  await page.keyboard.type( newPassword );


                  await page.focus( confirmInputSelector );
                  await page.hover( confirmInputSelector );
                  await page.click( confirmInputSelector );

                  await page.keyboard.type( newPassword );


                  await page.evaluate( ( passwordInputSelector, confirmInputSelector, newPassword ) => {
                    const $passwordInput = document.querySelector( passwordInputSelector );
                    const $confirmInput = document.querySelector( confirmInputSelector );

                    if ( $passwordInput !== null && $confirmInput !== null )
                    {
                      const $passwordForm = $passwordInput.closest( 'form' );
                      const $passwordSubmitButton = $passwordForm.querySelector( 'button[type="submit"]' );

                      if ( !$passwordInput.value.trim() )
                      {
                        $passwordInput.value = newPassword;
                      }

                      if ( $confirmInput.value.trim() )
                      {
                        $confirmInput.value = newPassword;
                      }

                      if ( $passwordSubmitButton !== null )
                      {
                        $passwordSubmitButton.click();
                      }
                      else
                      {
                        $passwordForm.submit();
                      }
                    }
                  }, passwordInputSelector, confirmInputSelector, newPassword );
                }


                await page.waitForTimeout( 3000 );


                const $skip_phone_link = await page.$( '[data-t="restore-bind-phone-skip"] a' );
                if ( $skip_phone_link !== null )
                {
                  $skip_phone_link.click();
                  await page.waitForTimeout( 3000 );
                }

                if ( /^https:\/\/direct\.yandex\.ru\/registered\/main.\pl/.test( await page.url() ) )
                {
                  if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
                  {
                    fs.writeFileSync( _post[ 'cookies_dir' ] + '/password', newPassword );
                    await this.writeCookies();
                  }

                  return true;
                }
              }
            }
          }



          /**
           * Проверка на необходмость ввода контрольного вопроса
           */
          await this.checkСontrolAnswerInput();


          await page.waitForTimeout( 2000 );

          /**
           * Пропуск действия
           */
          var skip_selectors = [ '.registration__avatar-btn', '.header-skip-link', '.Button2_view_contrast-pseudo' ];
          for ( var ssi = 0; ssi < skip_selectors.length; ssi ++  )
          {
            if ( await page.$( skip_selectors[ ssi ] ) !== null )
            {
              await page.click( skip_selectors[ ssi ] );
              await page.waitForTimeout( 2000 );

              if ( await this.checkIpBlock() )
              {
                process.exit();
              }
            }
          }


          /**
           * Проверка на подтверждения телефона по SMS
           */
          var account_blocked = await this.checkAccountBlock();
          if ( account_blocked )
          {
            return account_blocked;
          }



          for ( let i = 0; i < 120; i ++ )
          {
            let current_url = await page.url();

            if ( current_url == cached_url || /^https:\/\/sso\./.test( current_url ) )
            {
              await page.waitForTimeout( 100 );
              i++;
            }
            else
            {
              break;
            }
          }

          if ( /^https:\/\/direct\.yandex\.ru\/registered\/main.\pl/.test( await page.url() ) )
          {
            if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
            {
              await this.writeCookies();
            }

            return true;
          }
        }
        else if ( await page.$('input[name="question"]' ) !== null )
        {
          /**
           * Проверка на необходмость ввода контрольного вопроса
           */
          await this.checkСontrolAnswerInput();


          await page.waitForTimeout( 2000 );


          /**
           * Пропуск действия
           */
          var skip_selectors = [ '.registration__avatar-btn', '.header-skip-link', '.Button2_view_contrast-pseudo' ];
          for ( var ssi = 0; ssi < skip_selectors.length; ssi ++  )
          {
            if ( await page.$( skip_selectors[ ssi ] ) !== null )
            {
              await page.click( skip_selectors[ ssi ] );
              await page.waitForTimeout( 2000 );

              if ( await this.checkIpBlock() )
              {
                process.exit();
              }
            }
          }

          if ( /^https:\/\/direct\.yandex\.ru\/registered\/main.\pl/.test( await page.url() ) )
          {
            if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
            {
              await this.writeCookies();
            }

            return true;
          }
        }
        else
        {
          console.log( 'ошибка заполнения поля логина' );
          return { 'error' : 'ошибка заполнения поля логина' };
        }



        let cliked_2fa = false;
        const $password_button = await page.$( '.PasswordButton' );
        if ( $password_button !== null )
        {
          await $password_button.click();
          await page.waitForTimeout( 1000 );
          await this.fillPassword();
          await page.waitForTimeout( 1000 ); //не удалять, иначе ошибки

          cliked_2fa = true;
        }
        else if ( typeof _post[ 'account' ][ 'password_2fa' ] && _post[ 'account' ][ 'password_2fa' ]
                  && await page.$( '.RadioButton-Control[value="otp"]' ) !== null )
        {
          await page.evaluate( () => {
            document.querySelector( '.RadioButton-Control[value="otp"]' ).closest( '.RadioButton-Radio' ).click();
          });

          await page.waitForTimeout( 1000 );
          await this.fillPassword();
          await page.waitForTimeout( 1000 ); //не удалять, иначе ошибки

          cliked_2fa = true;
        }
        else if ( await page.$( '.MagicPromoPage-controls a' ) !== null )
        {
          await page.$( '.MagicPromoPage-controls a' ).click();
          cliked_2fa = true;
        }
        else if (  await page.$( '#passp-field-otp' ) !== null )
        {
          cliked_2fa = true;
        }
        else if ( typeof _post[ 'account' ][ 'password_2fa' ] && _post[ 'account' ][ 'password_2fa' ] )
        {
          var account_blocked = await this.checkAccountBlock();
          if ( account_blocked )
          {
            return account_blocked;
          }

          const error = 'ошибка авторизации: не найден переключатель для 2fa пароля';
          console.log( error );
          return { 'error' : error };
        }


        /**
         * Проверка на подтверждения телефона по SMS
         */
        account_blocked = await this.checkAccountBlock();
        if ( account_blocked )
        {
          return account_blocked;
        }

        if ( /^https:\/\/direct\.yandex\.ru\/registered\/main.\pl/.test( await page.url() ) )
        {
          if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
          {
            await this.writeCookies();
          }

          return true;
        }


        if ( typeof _post[ 'account' ][ 'password_2fa' ] && _post[ 'account' ][ 'password_2fa' ] && cliked_2fa )
        {
          if ( await page.$( '#passp-field-otp' ) !== null )
          {
            const response = await request.post({
              'url' : 'https://2fa-auth.com/wp-admin/admin-ajax.php',
              'headers': {
                'Referer' : 'https://2fa-auth.com/',
                'X-Requested-With' :  'XMLHttpRequest'
              },
              'form' : {
                'action' : 'isures_2fa',
                'key' : _post[ 'account' ][ 'password_2fa' ]
              }
            });

            const auth_code = /isures-2fa--code.+value=[\'"]([^\'"]+)[\'"]/.exec( response );

            if ( auth_code !== null )
            {
              await seoa.fillTextInput( '#passp-field-otp', auth_code[ 1 ], 100 );

//fs.writeFileSync( rootPath + '/_errors/authcode.txt',  auth_code[ 1 ] );
//fs.writeFileSync( rootPath + '/_errors/authcode.png',  await page.screenshot() );

/*
              await page.waitForTimeout( 1000 );

              if ( await page.$( action[ 'selector' ] ) !== null )
              {
                //await seoa.action( action[ 'action' ], action[ 'selector' ], '.footer, .footer__links, .AuthFooter' );
              }
*/

/*
              const page_url = await page.url();
              if ( /^https:\/\/sso\.(ya|passport\.yandex)\.ru/.test( page_url ) || page_url.indexOf( 'https%3A%2F%2Fdirect.yandex.ru%2Fregistered%2Fmain.pl' ) > -1 )
              {
                //await page.waitForTimeout( 2000 ); //мало
                await page.waitForTimeout( 2500 );
              }
*/
              //await page.waitForTimeout( 6000 );
              await page.waitForTimeout( 8000 );

              /**
               * Проверка на подтверждения телефона по SMS
               */
              account_blocked = await this.checkAccountBlock();
              if ( account_blocked )
              {
                return account_blocked;
              }


              if ( /^https:\/\/direct\.yandex\.ru\/registered\/main.\pl/.test( await page.url() ) )
              {
                if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
                {
                  await this.writeCookies();
                }

                return true;
              }
            }
            else
            {
              const error = 'ошибка авторизации: ошибка получения кода авторизации от сервиса 2fa-auth.com';
              console.log( error );
              return { 'error' : error };
            }
          }
          else
          {
            const error = 'ошибка авторизации: не найдено поля для 2fa пароля';
            console.log( error );
            return { 'error' : error };
          }

          break;
        }

//<a data-t="backpane" href="https://direct.yandex.ru/registered/main.pl?cmd=advancedForecast" class="PreviousStepButton PreviousStepButton_alignVertical" aria-label="Назад"><span data-link="https://direct.yandex.ru/registered/main.pl?cmd=advancedForecast"></span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="PreviousStepButton-icon"><path d="M2.40628 13.058C1.82161 12.4724 1.8216 11.5276 2.40628 10.9421C4.21771 9.12778 7.75104 5.58897 8.03999 5.30001C8.42999 4.91001 9.06999 4.91001 9.45999 5.30001C9.84999 5.69001 9.84999 6.32001 9.45999 6.71001L6.74328 9.42672C6.20889 9.96111 5.61652 10.4323 4.97578 10.8331L4.63311 11.0474L4.84118 11.254C5.57493 11.0854 6.32616 11 7.0806 11H21.0025C21.5548 11 22.0025 11.4477 22.0025 12C22.0025 12.5523 21.5548 13 21.0025 13H7.0806C6.32616 13 5.57493 12.9146 4.84118 12.746L4.63311 12.9526L4.97578 13.1669C5.61652 13.5677 6.20889 14.0389 6.74328 14.5733L9.45999 17.29C9.84999 17.68 9.84999 18.31 9.45999 18.7C9.06999 19.09 8.42999 19.09 8.03999 18.7C7.75104 18.411 4.21771 14.8722 2.40628 13.058Z"></path></svg></a>
        const backclick = await page.evaluate( () => {
          //const $backclick_button = document.querySelector( '[data-t="backpane"]' );
          const $backclick_button = document.querySelector( '.PreviousStepButton' );
          if ( $backclick_button != null )
          {
            if ( /^https:\/\/direct\.yandex\.ru\/registered\/main.\pl/.test( $backclick_button.href ) )
            {
              $backclick_button.click();
              return true;
            }
          }
        });

        if ( backclick )
        {
          await page.waitForTimeout( 3000 );

          /**
           * Проверка на подтверждения телефона по SMS
           */
          account_blocked = await this.checkAccountBlock();
          if ( account_blocked )
          {
            return account_blocked;
          }

          if ( /^https:\/\/direct\.yandex\.ru\/registered\/main.\pl/.test( await page.url() ) )
          {
            if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
            {
              await this.writeCookies();
            }

            return true;
          }
        }

        /**
         * Пропуск входа через отпечаток или лицо
         *
        const skip_face_click = await page.evaluate( () => {
          const $skip_face_button = document.querySelector( '.Button2_view_contrast-pseudo' );
          if ( $skip_face_button != null )
          {
            if ( /Не.*сейчас/gi.test( $skip_face_button.innerText ) )
            {
              $skip_face_button.click();
              return true;
            }
          }
        });

        if ( skip_face_click )
        {
          await page.waitForTimeout( 3000 );

          /**
           * Проверка на подтверждения телефона по SMS
           * /
          account_blocked = await this.checkAccountBlock();
          if ( account_blocked )
          {
            return account_blocked;
          }

          if ( /^https:\/\/direct\.yandex\.ru\/registered\/main.\pl/.test( await page.url() ) )
          {
            if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
            {
              await this.writeCookies();
            }

            return true;
          }
        }
         */


        if ( i == 2 )
        {
          const error = 'ошибка авторизации, не найдены селекторы<b>' + _post.account.user + ':' + _post.account.password + '</b>';
          console.log( error );
          return { 'error' : error };
//fs.writeFileSync( rootPath + '/_errors/direct-0.html', await page.content() );
        }
      //}
      }



      const backclick = await page.evaluate( () => {
        //const $backclick_button = document.querySelector( '[data-t="backpane"]' );
        const $backclick_button = document.querySelector( '.PreviousStepButton' );
        if ( $backclick_button != null )
        {
          if ( /^https:\/\/direct\.yandex\.ru\/registered\/main.\pl/.test( $backclick_button.href ) )
          {
            $backclick_button.click();
            return true;
          }
        }
      });

      if ( backclick )
      {
        await page.waitForTimeout( 3000 );

        /**
         * Проверка на подтверждения телефона по SMS
         */
        account_blocked = await this.checkAccountBlock();
        if ( account_blocked )
        {
          return account_blocked;
        }

        if ( /^https:\/\/direct\.yandex\.ru\/registered\/main.\pl/.test( await page.url() ) )
        {
          if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
          {
            await this.writeCookies();
          }

          return true;
        }
      }



      /**
       * авторизация для поиска
       */
      if ( retpath.indexOf( 'https://ya.ru' ) > -1 )
      {
        if ( await page.url().indexOf( '&finish=https%3A%2F%2Fya.ru' ) > -1 )
        {
          await page.waitForTimeout( 1000 );
        }

        if ( await page.url().indexOf( 'https://ya.ru' ) > -1 )
        {
          return true;
        }
      }
      else if ( retpath.indexOf( 'direct.yandex.ru' ) > -1 )
      {
        /**
         * Проверка на подтверждения телефона по SMS
         * необходимо дополнительно проверять перед задержкой, возможная страница https://passport.yandex.ru/auth/changepassword
         */
        account_blocked = await this.checkAccountBlock();
        if ( account_blocked )
        {
          return account_blocked;
        }

        const page_url = await page.url();
        if ( /^https:\/\/sso\.(ya|passport\.yandex)\.ru/.test( page_url ) || page_url.indexOf( 'https%3A%2F%2Fdirect.yandex.ru%2Fregistered%2Fmain.pl' ) > -1 )
        {
          //await page.waitForTimeout( 2000 ); //мало
          await page.waitForTimeout( 2500 );
        }

        /**
         * Проверка на подтверждения телефона по SMS
         */
        account_blocked = await this.checkAccountBlock();
        if ( account_blocked )
        {
          return account_blocked;
        }


        if ( /^https:\/\/direct\.yandex\.ru\/registered\/main.\pl/.test( await page.url() ) )
        {
          return true;
        }
      }


      if ( await this.checkCaptcha() === 'stop' )
      {
        //return { 'error' : 'ошибка авторизации <b>' + _post.account.user + ':' + _post.account.password + '</b>' };
        return { 'error' : 'ошибка авторизации: капча не распознана' };
      }

      /**
       * Проверка на необходмость ввода контрольного вопроса
       */
      await this.checkСontrolAnswerInput();


      /**
       * Проверка на необходмость ввода телефона
       */
      await this.checkPhoneControlInput();


      /**
       * Проверка на подтверждения телефона по SMS
       */
      account_blocked = await this.checkAccountBlock();
      if ( account_blocked )
      {
        return account_blocked;
      }

      /**
       * Проверка на необходмость ввода дополнительного email
       */
      await this.checkAdditionalEmailInput();


      /**
       * Пропуск действия
       */
      var skip_selectors = [ '.registration__avatar-btn', '.header-skip-link', '.Button2_view_contrast-pseudo' ];
      for ( var ssi = 0; ssi < skip_selectors.length; ssi ++  )
      {
        if ( await page.$( skip_selectors[ ssi ] ) !== null )
        {
          await page.click( skip_selectors[ ssi ] );
          await page.waitForTimeout( 2000 );

          if ( await this.checkIpBlock() )
          {
            process.exit();
          }
        }
      }

      /**
       * Возвращение статуса, сообщающего об остановке выполнения задания,
       * в связи с ошибкой или большим количеством капч
       */
      if ( await this.checkCaptcha() === 'stop' )
      {
        //return { 'error' : 'ошибка авторизации 1 <b>' + _post.account.user + ':' + _post.account.password + '</b>' };
        return { 'error' : 'ошибка авторизации: капча не распознана' };
      }


      if ( retpath == await page.url() )
      {
        await page.waitForTimeout( 1000 );

        if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
        {
          await this.writeCookies();
        }

        return true;
      }


      var return_link = await page.evaluate( () => {
        if ( document.querySelector( '.domik-retpath > a' ) != null )
        {
          document.querySelector( '.domik-retpath > a' ).id = 'seoa-return';
          return true;
        }
      });

      if ( return_link )
      {
        await page.focus( '#seoa-return' );
        await page.hover( '#seoa-return' );
        await page.click( '#seoa-return' );
        await page.waitForTimeout( 500 );
      }


      /**
       * Возвращение статуса, сообщающего об остановке выполнения задания,
       * в связи с ошибкой или большим количеством капч
       */
      if ( await this.checkCaptcha() === 'stop' )
      {
        //return { 'error' : 'ошибка авторизации 2 <b>' + _post.account.user + ':' + _post.account.password + '</b>' };
        return { 'error' : 'ошибка авторизации 2: капча не распознана' };
      }


      var pageContent = await page.evaluate( () => { return document.querySelector( 'body' ).innerHTML; });
      if ( await !loginRegexp.test( pageContent ) )
      {
        console.log( 'ошибка авторизации ' + _post.account.user + ':' + _post.account.password );
//fs.writeFileSync( rootPath + '/_errors/direct-3.html', await page.content() );
        return { 'error' : 'ошибка авторизации 3 <b>' + _post.account.user + ':' + _post.account.password + '</b>' };
      }

      if ( _post.account.cookies != undefined && !_post.account.cookies.trim() )
      {
        await this.writeCookies();
      }

      return true;
    }
  }



  /**
   * Проверка блокировки аккаунта ( подтверждение телефона по SMS )
   */
  async checkAccountBlock()
  {
    let content = await page.content();
    content = content.replace( /&nbsp;/g, ' ' );
    content = content.replace( /\s+/g, ' ' );

    const search_str = [
      'Мы временно ограничили доступ',
      'Доступ временно ограничен',
      'Ваш номер телефона:',
      'Придумайте пароль',
      'Неправильный логин или пароль',
      'Неправильный пароль',
      'Неверный пароль',
      'Ответ неверный',
      'Заполните анкету',
      'Неверный пароль',
      'Пароль не указан',
      'Введите код из',
      //'Логин введен некорректно',
      //'Логин удален',
      //'Восстановить доступ',
      //'Введите код из смс',
      //'Введите код из пуш-уведомления Яндекс Go'
    ].join( '|' );

    const re = new RegExp( search_str, 'gi' );

    if ( re.test( content ) )
    {
      console.log( 'ошибка авторизации, требуется подтверждения по SMS (' +  _post.account[ 'account_key' ] + ')' );
      return { 'error' : 'ошибка авторизации, требуется подтверждения по SMS (' +  _post.account[ 'account_key' ] + ')' };
    }
    else
    {
      return false;
    }
  }


  /**
   * Проверка блокировки ip
   */
  async checkIpBlock()
  {
    //const page_content = await page.content();
    const page_content = seoa.pageContent();
    if ( /<div[^>]+header__code[^>]+>403<\/div>/.test( page_content ) || /нашему сервису временно запрещён/i.test( page_content ) )
    {
      console.log( 'yandex=403' );
      //process.exit();

      return true;
    }
    else
    {
      return false;
    }
  }
}

module.exports = yandex;
