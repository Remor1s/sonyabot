/**
 * Функции для работы с Google
 *
 * @package SerpHunt
 * @subpackage Core
 */

const fs = require('fs');

class google
{
  constructor()
  {
    this.setCookies = false;
    this.setUULE = false;
    this.UULE = '';
    this.UULE_prev = '';

		this.log = false;
    this.searchURL = null;
    this.lastSearchPage = null;
    this.region = '';
    this.mainRegion = '';
    this.domain = '.com';
    //this.resultsPerPage = 100;
    this.resultsPerPage = 10;
    this.searchDepth = 100;
    this.captchaSelector = '#infoDiv, #recaptcha, input[name="captcha"]';
    this.searchSelector = '#fbar, #foot, #bfoot, #ofr, g-full-page-view';
    this.waitSelector = this.searchSelector + ', ' + this.captchaSelector;
    this.cookies = '';

    this.searchOperators = {
      indexing_number: php.trim( fs.readFileSync( rootPath + '/data/search-operators/indexing-number-yandex.txt' ).toString() )
    };

    /**
     * Настройка региона по умолчанию
     */
    if ( typeof siteOptions != 'undefined' && siteOptions['google'] != undefined )
    {
      for ( var region_key in siteOptions['google']['position_regions'] )
      {
        if ( siteOptions['google']['position_regions'][region_key]['region_id'] != undefined
              && siteOptions['google']['position_regions'][region_key]['is_main'] != undefined
              && php.trim( siteOptions['google']['position_regions'][region_key]['is_main'] ) )
        {
          this.mainRegion = region_key;

          if ( siteOptions['google']['position_regions'][region_key]['domain'] != undefined
              && php.trim( siteOptions['google']['position_regions'][region_key]['domain'] ) )
          {
            this.domain = siteOptions['google']['position_regions'][region_key]['domain'];
          }

          break;
        }
      }
    }
    else
    {
      this.setUULE = true;
    }
  }


  /**
   * Настройк URL поиска
   */
  async setSearchURL( query, region )
  {
    seoa.captchaSearch = 'google';


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



    if ( !this.setCookies )
    {
      this.setCookies = true;

      await seoa.pageLoad(
        'https://www.google' + this.domain + '/',
        'form[action*="/search"], #infoDiv, #recaptcha, input[name="captcha"]' //#infoDiv - captcha
      );



      if ( await page.$( '#infoDiv, #recaptcha, input[name="captcha"]' ) === null )
      {
        if ( fs.existsSync( seoa.profilePath + '/google-cookies.txt' ) )
        {
          let cookies = fs.readFileSync( seoa.profilePath + '/google-cookies.txt' );
          cookies = JSON.parse( cookies );
          await page.setCookie( ...cookies );
        }

        if ( fs.existsSync( seoa.profilePath + '/google-session-storage.txt' ) )
        {
          let session_storage = fs.readFileSync( seoa.profilePath + '/google-session-storage.txt' );
          session_storage = JSON.parse( session_storage );

          await page.evaluate( ( data ) => {
            for ( const [ key, value ] of Object.entries( data ) )
            {
              sessionStorage[ key ] = value;
            }
          }, session_storage);
        }

        if ( fs.existsSync( seoa.profilePath + '/google-local-storage.txt' ) )
        {
          let local_storage = fs.readFileSync( seoa.profilePath + '/google-local-storage.txt' );
          local_storage = JSON.parse( local_storage );

      //console.log( '' ); console.log( local_storage ); console.log( '' );

          await page.evaluate( ( data ) => {
            for ( const [ key, value ] of Object.entries( data ) )
            {
              localStorage[ key ] = value;
            }
          }, local_storage);
        }


        const cookies = await page.cookies();
        for ( let k in cookies )
        {
          if ( cookies[ k ][ 'name' ] == 'UULE' )
          {
            this.UULE_prev = cookies[ k ][ 'value' ];
            break;
          }
        }
      }


      if ( typeof siteOptions != 'undefined'
            && siteOptions['google'] != undefined
            && siteOptions['google']['position_regions'][region] != undefined )
      {
        const region_data = siteOptions['google']['position_regions'][region];

        if ( typeof region_data[ 'uule' ] != 'undefined' && region_data[ 'uule' ].trim() )
        {
          this.UULE = 'w+CAIQICI' + region_data[ 'uule' ];
        }
        else
        {
          this.UULE = '';
        }


/*
      if ( typeof siteOptions[  'latitude' ] != 'undefiend' )
      {
        let uule = 'a+' + btoa(
          'role: 1'
          + "\n" + 'producer: 12'
          + "\n" + 'provenance: 6'
          + "\n" + 'timestamp: ' + ( new Date().getTime() )
          + "\n" + 'latlng {'
            + "\n" + '  latitude_e7: ' + ( region_data[ 'latitude' ] * 10000000  )
            + "\n" + '  longitude_e7: ' + ( region_data[ 'longitude' ] * 10000000  )
          + "\n" + '}'
          + "\n" + 'radius: 10000'
          //+ "\n" + 'radius: 1000000'
        );

        await page.setCookie({ 'name' : 'UULE', 'value' : uule });
      }
*/
      }
    }



    if ( this.lastSearchPage )
    {
      return true;
    }



    if ( /(site|url|info|"):/.test( query ) && typeof _post[ 'without_rucaptcha' ] != 'undefined' )
    {
      //captchaSolver.forceService = 'rucaptcha.com';
    }



    if ( !this.searchURL )
    {
      this.searchURL = 'https://www.google' + this.domain + '/search?q=' + encodeURIComponent( query );
    }

    this.searchURL = this.searchURL.replace( '?', '?&' );
    this.searchURL = this.searchURL.replace( /q=[^&]+/, 'q=' + encodeURIComponent( query )  );
    this.searchURL = this.searchURL.replace( /[&\?]start=\d+/g, '' );
    this.searchURL = this.searchURL.replace( /[&\?]tbs=[^&]*/g, '' );
    this.searchURL = this.searchURL.replace( /[&\?]tbm=[^&]*/g, '' );
    this.searchURL = this.searchURL.replace( /[&\?]uule=[^&]*/g, '' );
    this.searchURL = this.searchURL.replace( /[&\?]gl=[^&]*/g, '' );
    this.searchURL = this.searchURL.replace( /[&\?]hl=[^&]*/g, '' );
    this.searchURL = this.searchURL.replace( /[&\?]num=[^&]*/g, '' );

    if ( !/(site|url|info|"):/.test( query ) && typeof siteOptions[  'quicklinks' ] == 'undefined' && this.resultsPerPage > 10 && this.searchDepth > 10 )
    {
      this.searchURL += '&num=' + this.resultsPerPage;
    }

    if ( /^[A-Z][A-Z]$/.test( region ) )
    {
      this.searchURL += '&gl=' + region; //при этом параметре бесконечная капча
    }
    else if ( typeof siteOptions != 'undefined'
              && siteOptions['google'] != undefined
              && siteOptions['google']['position_regions'][region] != undefined )
    {
      var region_data = siteOptions['google']['position_regions'][region];

      if ( php.trim( region_data['region_id']  ) )
      {
        if ( region_data['is_main'] != undefined )
        {
          this.mainRegion = region;
        }

        //this.searchURL += '&uule=' +'w CAIQICI' + region_data['uule'];
        this.searchURL += '&gl=' + region_data['country_code'];  //при этом параметре бесконечная капча
      }

      if ( region_data['language'] != undefined && php.trim( region_data['language']  ) )
      {
        this.searchURL += '&hl=' + region_data['language'];
      }

      if ( region_data['domain'] != undefined && php.trim( region_data['domain'] ) )
      {
        this.domain = region_data['domain'];

        this.searchURL = this.searchURL.replace(
          /^(https:\/\/(?:www\.)?google)\.[^\/\?]+/,
          '$1' + this.domain,
          this.searchURL
        );
      }
    }

    this.searchURL = this.searchURL.replace( /\?&+/g, '?' );
    this.searchURL = this.searchURL.replace( /&+/g, '&' );

    //this.searchURL += '&start=0';

    //this.searchURL.replace( /&\d+$/g, '' );
    //this.searchURL += '&' + ( new Date().getTime() );


    if ( !await seoa.pageLoad( this.searchURL, this.waitSelector ) )
    {
      return 'stop';
    }



    /**
     * Задержка запроса
     */
    await seoa.delay( 'google', query );


    if ( /^https?:\/\/(www\.)?google\.[a-z\.]+\/search/.test(  await page.url() )  )
    {
      this.searchURL = await page.url();
    }


    /**
     * Обновление контрольного времени выполнения задания
     */
    await seoa.updateTaskExecutionTime( 'google' );


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
    await seoa.updateTaskExecutionTime( 'google' );



    await page.waitForTimeout( 1000 );

    if ( !this.setUULE && this.UULE != this.UULE_prev )
    {
      if ( this.UULE )
      {
        await page.setCookie({ 'name' : 'UULE', 'value' : this.UULE });
      }
      else
      {
        await page.deleteCookie({ 'name' : 'UULE' });
      }

      this.setUULE = true;
      this.UULE_prev = this.UULE;

      await page.reload();


      if ( await this.checkCaptcha() === 'stop' )
      {
        return 'stop';
      }


      await this.savePageCookies();
    }


/*
      for ( let i = 1; i <= 2; i ++ )
      {
        let uule_found = false;
        const cookies = await page.cookies();
        for ( let k in cookies )
        {
          if ( cookies[ k ][ 'name' ] == 'UULE' && cookies[ k ][ 'value' ] == this.UULE )
          {
            uule_found = true;
          }
        }

        if ( uule_found )
        {
          break;
        }
        else
        {
          await page.reload();
        }
      }
*/



/*
let page_url = await page.url();
let fname = md5( query ).replace( /[^а-яёa-z]/g, '_' ) + ' - ' + md5( page_url );
let content = await page.content();
fs.writeFileSync( rootPath + '/' + fname + '.html', query + '\n\n' + page_url + '\n\n' + content );
*/

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


    const url_status = await this.setSearchURL( query, region );
    if ( url_status !== true )
    {
      return url_status;
    }


    let results = await page.evaluate( ( wait_selector, siteOptions ) => {
      let results = {};
      let position = 1;
      let stopWords = [
        'maps\\.google',
        '\/aclk\\?',
        'googleadservices',
        '\/\(www\\.\)?youtube\\.\[\^\\/\\.]\+\/'
      ];

      stopWords = [ new RegExp( '/(' + stopWords.join( ')|(' ) + ')', 'i' ) ];

      if ( document.title.indexOf( 'Error 403' ) > -1 )
      {
        return 403;
      }

      if ( document.querySelector( wait_selector ) === null )
      {
        return {};
      }



      let $items = document.querySelectorAll( 'g-card' ); //Мобильная выдача по запросу "спорт"
      if ( $items.length < 10 )
      {
        const $g_dialog = document.querySelectorAll( 'g-dialog' );
        for ( let i in $g_dialog )
        {
          if ( typeof $g_dialog[ i ].closest != 'undefined' )
          {
            const $hveid = $g_dialog[ i ].closest( 'div[data-hveid]' );
            if ( $hveid !== null )
            {
              $hveid.remove();
            }
          }
        }


        const $maps = document.querySelectorAll( '[data-bsrc*="/maps/"],img[src*="/maps/"],[data-url*="/maps/dir/"]' );
        if ( $maps !== null )
        {
          for ( let i in $maps )
          {
            if ( typeof $maps[ i ].closest != 'undefined' )
            {
              const $hveid = $maps[ i ].closest( 'div[data-hveid]' );
              if ( $hveid !== null )
              {
                $hveid.remove();
              }
            }
          }
        }


        const $iframe = document.querySelectorAll( 'iframe' );
        for ( let i in $iframe )
        {
          if ( typeof $iframe[ i ].closest != 'undefined' )
          {
            const $hveid = $iframe[ i ].closest( 'div[data-hveid]' );
            if ( $hveid !== null )
            {
              $hveid.remove();
            }
          }
        }


        //[data-hveid][data-ved][jsaction][jscontroller]
        $items = document.querySelectorAll( '[data-hveid][data-ved][jsaction]:not(.related-question-pair)' );
/*
        if ( $items.length > 0 )
        {
          for ( let i = 0; i < $items.length; i ++ )
          {
          }
        }
*/
      }


      if ( $items.length > 0 )
      {
        topcycle:
        for ( let i = 0; i < $items.length; i++ )
        {
          const itemHTML = $items[i].outerHTML;

          if ( $items[ i ].id && $items[ i ].tagName != 'G-CARD' )
          {
            continue;
          }

          for ( let swi = 0; swi < stopWords.length; swi++ )
          {
            //if ( itemHTML.indexOf( stopWords[ swi ] ) > -1 )
            if ( stopWords[ swi ].test( itemHTML ) )
            {
              continue topcycle;
            }
          }


          let $title = null;
          if ( typeof $items[ i ].dataset.hveid != 'undefined' )
          {
            $title = $items[ i ].querySelector( '[role="heading"]' );
          }
          else
          {
            const $h3 = $items[ i ].querySelector( 'h3.r' );

            if ( $h3 !== null && $h3.children.length > 0 && $h3.children[ 0 ].tagName == 'A' )
            {
              $title = $h3.children[ 0 ];
            }
          }


          let pageURL = false;
          let linklist = [];
          let link_found = false;
          let links = $items[ i ].querySelectorAll( 'a' );
          let domain_regexp = false;

          if ( typeof siteOptions[ 'domain' ] != 'undefined' )
          {
            domain_regexp = new RegExp(
              '^\(https\?:\)\?\(\\/\\/)\?(www\\.)?\(' + siteOptions[ 'domain' ] + '\|' + siteOptions[ 'domain_idn' ] + '\)(\\/\|\\?)',
              'i'
            );
          }

          for( let li = 0; li < links.length; li ++ )
          {
            if ( typeof links[ li ].href != 'undefined' )
            {
              let href = links[ li ].href;

              if ( href.length > 3
                    && !/(google[^\/]+\/search\?)|(\/(www\.)?youtube\.[^\/\.]+\/)|(^\/(maps|video|news)\/)|(^\/search\?)|(\/translate\.google\.)|(^javascript\:)|(\/webcache\.)/.test( href )
                    && ( !pageURL || typeof siteOptions[  'quicklinks' ] != 'undefined' ) )
              {
                if ( !pageURL )
                {
                  pageURL = href;

                  if ( !$title && links[ li ].querySelector( 'h3' ) !== null )
                  {
                    $title = links[ li ].querySelector( 'h3' );
                  }

                  if ( typeof siteOptions[ 'quicklinks' ] == 'undefined' )
                  {
                    break;
                  }
                }
                else if ( domain_regexp
                          && typeof siteOptions[ 'quicklinks' ] != 'undefined'
                          && domain_regexp.test( href )
                          && href != pageURL )
                {
                  //linklist.push( links[ li ].outerHTML );
                  linklist.push( href );
                }
              }
            }
          }


          if ( !pageURL )
          {
            continue;
          }


          if ( $title )
          {
            const $favicon = $title.querySelector( '.favicon' )
            if ( $favicon !== null )
            {
              $favicon.remove();
            }

            var title = $title.innerHTML.trim();

            title = title.replace( /<br[^>]*>/g, ' ' );
            title = title.replace( /<(b|em|strong)[^>]*>/g, '{{kstrong}}' );
            title = title.replace( /<\/(b|em|strong)>/g, '{{/kstrong}}' );

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


          let description = null;

          const $spanlist = $items[ i ].querySelectorAll( 'span' );
          for ( let si = 0; si < $spanlist.length; si ++ )
          {
            if ( $spanlist[ si ].querySelector( 'em' ) !== null )
            {
              description = $spanlist[ si ].innerHTML.trim();

              description = description.replace( /<br[^>]*>/g, ' ' );
              description = description.replace( /<(b|em|strong)[^>]*>/g, '{{kstrong}}' );
              description = description.replace( /<\/(b|em|strong)>/g, '{{/kstrong}}' );

              description = description.replace( /<[^>]*>/g, '', );

              description = description.replace( /\{\{kstrong\}\}/g, '<span class="kstrong">' );
              description = description.replace( /\{\{\/kstrong\}\}/g, '</span>' );

              description = description.replace( /\s+/g, ' ', );
              description = description.trim();
              break;
            }
          }


          const $cacheLink = $items[ i ].querySelector( 'a[href*="webcache.googleusercontent.com/search?q=cache:"]' );
          if ( $cacheLink !== null )
          {
            var cacheURL = $cacheLink.href;
          }
          else
          {
            var cacheURL = null;
          }


          let domain = /^(?:https?:)?(?:\/\/)?(?:(?:www|m)\.)?([^\/\?]+)/.exec( pageURL );
          if ( domain != null )
          {
            domain = domain[ 1 ];
          }
          else
          {
            domain = pageURL;
          }


          results[ position ] = {
            'site' : domain.toLowerCase(),
            'page_url' : pageURL,
            'title' : title,
            'description' : description,
            'cache_url' : cacheURL,
            'linklist' : linklist
          };


          position ++;
        }

        if ( document.querySelector( 'form[action*="/search"]' ) && Object.keys( results ).length < 1 )
        {
          results[ -1 ] = {
            'site' : null,
            'page_url' : null,
            'title' : null,
            'description' : null,
            'cache_url' : null,
            'linklist' : null
          };
        }
      }
      else if ( document.querySelector( 'form[action*="/search"]' ) !== null )
      {
        results[ -1 ] = {
          'site' : null,
          'page_url' : null,
          'title' : null,
          'description' : null,
          'cache_url' : null,
          'linklist' : null
        };
      }

      return results;

    }, this.searchSelector, siteOptions );



    if ( results == 403 )
    {
      console.log( 'page google=403' );
      return 'stop';
    }
    else if ( Object.keys( results ).length > 0 )
    {
      const content = await page.content();

//console.log( content );

      for ( let i in results )
      {
        if ( !results[ i ][ 'cache_url' ] )
        {
          const url = php.pregQuote( results[ i ][ 'page_url' ], '/' );
          const cacheUrlRegexp = new RegExp( '(https:\/\/webcache.googleusercontent.com\/search\?[^ ]+' + url + '[^ ]*)[\\\\]x22 ', 'g' );
          let cacheURL = cacheUrlRegexp.exec( content );
          if ( cacheURL != null )
          {
            cacheURL = php.hexDecode( cacheURL[ 1 ] );
            results[ i ][ 'cache_url' ] = php.decodeHtmlSpecialChars( cacheURL );
          }
        }
      }


      return results;
    }
    else
    {
      const title = await page.evaluate( ( wait_selector, siteOptions ) => {
        return document.title;
      });

      console.log( 'не найдены результаты google: ' + title );
      return 'stop';
    }
  }


  /**
   * Поиск URL следующей страницы поиска
   */
  async nextPage( resultsNumber )
  {
//return false;
    if ( resultsNumber < this.searchDepth * 0.91 )
    {
      var currentPage = await page.url();
      var currentUrlVars = querystring.parse( currentPage.replace( /^[^?]+\?/, '' ) );
      if ( currentUrlVars['start'] != undefined )
      {
        currentUrlVars['start'] *= 1;
      }
      else
      {
        currentUrlVars['start'] = 0;
      }

      const content = await page.content().toString();

      let q = encodeURIComponent( currentUrlVars['q'] );
      q = q.replace( /%20/g, '+' );
      q = php.pregQuote( q );

      //const regexp = new RegExp( '[\\\'"]([^\\\'"]+q=[^\\\'"]*)[\\\'"]', 'g' );
      const regexp = new RegExp( '[\\\'"]([^\\\'"]*\/search[^\\\'"]+q=' + q + '[^\\\'"]+start=\\d+[^\\\'"]*)[\\\'"]', 'g' );

      let nextPage = false;

      const nextPageMatches = content.match( regexp );
      if ( nextPageMatches != null )
      {
        for( let ui = 0; ui < nextPageMatches.length; ui ++ )
        {
          const urlVars = querystring.parse( nextPageMatches[ ui ].replace( /\&amp;/g, '&' ) );
          if ( urlVars[ 'start' ] != undefined && urlVars[ 'start' ] * 1 > currentUrlVars[ 'start' ] )
          {
            nextPage = currentPage.replace( /\&start=\d+/, '' );
            nextPage += '&start=' + urlVars[ 'start' ];

            this.lastSearchPage = true;
            return nextPage;
          }
        }
      }

      nextPage = await page.evaluate( ( wait_selector, results_per_page, search_url ) => {
        if ( document.querySelector( wait_selector ) === null )
        {
          return 'stop';
        }

        let $nav = document.querySelector( '#botstuff [role="navigation"]' );
        if ( $nav !== null )
        {
          const $linklist =  $nav.querySelectorAll( 'a' );

          if ( $linklist.length > 0 )
          {
            let currentPage = /[?&]start=(\d+)(&|$)/.exec( document.location.href );
            if ( currentPage === null )
            {
              currentPage = 0;
            }
            else
            {
              currentPage = currentPage[1] * 1;
            }

            let numdoc = /[?&]num=(\d+)(&|$)/.exec( $linklist[ 0 ].href );
            if ( numdoc === null )
            {
              //numdoc = results_per_page;
              numdoc = 10;
            }
            else
            {
              numdoc = numdoc[ 1 ] * 1;
            }

            const nextUrlRegExp = new RegExp( '[?&]start=' + ( currentPage + numdoc ) + '' );

            let nextURL = $linklist[ $linklist.length - 1 ].href;


            if ( nextUrlRegExp.test( nextURL ) )
            {
              let varlist = [ 'uule', 'gl', 'hl' ];
              for ( let k in varlist )
              {
                const re = new RegExp( '[?&]' + varlist[ k ] + '=([^&?]+)' );
                const v = re.exec( search_url );
                if ( !re.test( nextURL ) && v !== null )
                {
                  nextURL += '&' + varlist[ k ] + '=' + v[ 1 ];
                }
              }

              nextURL = nextURL.replace( /&+/g, '&' );

              return nextURL;
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
        else
        {
          return false;
        }
      }, this.searchSelector, this.resultsPerPage, this.searchURL );

//console.log( nextPage );

      if ( nextPage === 'stop' )
      {
        return 'stop';
      }
      else if ( nextPage === false )
      {
        return false;
      }
      else
      {
        this.lastSearchPage = true;

        var startURL = page.url().replace( /(^https?:\/\/(?:www\.)?google\.\w+)(\/.*)?$/, '$1' );
        nextPage = nextPage.replace( /(^https?:\/\/(?:www\.)?google\.\w+)?(\/.*)$/, '$2' );

        return startURL + nextPage;
      }
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

      if ( document.getElementById( 'result-stats' ) !== null )
      {
        var indexedPages = document.getElementById( 'result-stats' ).innerHTML;

        indexedPages = indexedPages.replace( /<([^ >]+)[^>]*>[^<]+<\/\1>/g, '' );
        indexedPages = indexedPages.replace( /<[^>]*>/g, '' );
        indexedPages = indexedPages.replace( /&nbsp;/g, '' );
        indexedPages = indexedPages.replace( /\D+/g, '' );
        indexedPages = indexedPages.trim();

        //indexedPages = indexedPages.replace( /\s+тыс/, '000' )
        //indexedPages = indexedPages.replace( /\s+млн/, '000000' );

        indexedPages = indexedPages.replace( /\D+/g, '' ) * 1;
      }
      else
      {
        var indexedPages = 0;
      }

      return indexedPages;

    });
  }




  async checkImageCaptcha( return_data  )
  {
    let iterations_limit = 1;

    for ( let x = 1; x <= iterations_limit; x ++ )
    {
      const captchaImg = await page.evaluate( () => {
        var $captchaImg = document.querySelector('img[src*="/sorry/image?"],img[src*="/captchaimg?"],img[src*="/Captcha?v=2"]');

        if ( $captchaImg !== null )
        {
          $captchaImg.id = 'unicaptcha';
          return $captchaImg.src;
        }
      });


      if ( await php.trim( captchaImg ) )
      {
console.log( 'page google=403' );
console.log( 'графическая капча google' );
return 'stop';

        captchaNumbers.parsing += 1;

        await console.log( 'google image captcha: start solving' );

        const $image_selector = await page.$( 'img[src*="/sorry/image?"],img[src*="/captchaimg?"],img[src*="/Captcha?v=2"]' );
        captchaImg = await $image_selector.screenshot({ encoding: "base64" });

        //captchaImg = await $image_selector.screenshot({ path: rootPath + '/google.png' });
        if ( captchaImg.length < 1000 )
        {
          console.log( 'слишком маленькое изображение для капчи гугла' );
          return 'stop';
        }

        captchaImg = 'base64:' + captchaImg;

  /*
        let cookielist = await page.cookies();
        if ( cookielist.length > 0 )
        {
          this.cookies = [];
          for ( let i in cookielist )
          {
            this.cookies.push( cookielist[ i ][ 'name' ] + ':' +  cookielist[ i ][ 'value' ] );
          }
          this.cookies = this.cookies.join( ';', this.cookies );
        }
  */

        const captchaCode = await captchaSolver.start(
          'image',
          captchaImg,
          {
            source: 'google',
            isBuffer: true
          }
        );

//console.log( captchaCode );

        if ( typeof captchaCode != 'undefined' && await php.trim( captchaCode ) )
        {
          await console.log( 'google image captcha: ' + captchaCode );

          if ( return_data )
          {
            return captchaCode;

            await console.log( 'google image captcha: end solving' );
          }

          await Promise.all([
            page.evaluate( ( captchaCode ) => {
              var $captcha_field = document.querySelector('input[name="captcha"]');
              if ( $captcha_field == null )
              {
                process.exit();
              }
              else
              {
                $captcha_field.value = captchaCode;
                $captcha_field.closest('form').submit();
              }
            }, captchaCode ),

            page.waitForNavigation({ timeout: 30000, waitUntil: [ 'domcontentloaded', 'networkidle2' ] })
          ]);
        }

        await console.log( 'google image captcha: end solving' );
        await page.waitForTimeout( 1000 );
      }
      else
      {
        return '';
      }
    }
  }



  /**
   * Обработка капчи
   */
  async checkCaptcha( return_data )
  {
    if ( await page.url() == 'about:blank' )
    {
      return false;
    }


    if ( typeof return_data == 'undefined' )
    {
      return_data = false;
    }


    if ( await this.checkImageCaptcha( false ) == 'stop' )
    {
      return 'stop';
    }


    const error_403 = await page.evaluate( ( wait_selector, siteOptions ) => {
      if ( document.title.indexOf( 'Error 403' ) > -1 )
      {
        return 403;
      }
    });

    if ( error_403 )
    {
      console.log( 'page google=403' );
      return 'stop';
    }


    /**
     * Рекапча
     */

    let iterations_limit = 1;
    let captcha = null;

    for ( let x = 1; x <= iterations_limit; x ++ )
    {
      captcha = await page.evaluate( () => {
        //console.log( ___grecaptcha_cfg.clients[ 0 ] );

        let captcha = null;

        let $recaptcha = document.getElementById('recaptcha');
        if ( $recaptcha != null )
        {
          captcha = {
            sitekey: $recaptcha.dataset.sitekey,
            s: $recaptcha.dataset.s,
            continue_url: document.querySelector('input[name="continue"]').value
          };
        }

        return captcha;
      });


      if ( captcha !== null )
      {

//console.log( 'прервано из-за google recaptcha' ); return 'stop';

//console.log( '\ngoogle recaptcha\n' );
//return 'stop';


if ( this.log )
{
  var t1 = new Date();

  if ( captchaSolver.forceService == 'rucaptcha.com' || typeof _post[ 'without_capmonster' ] != 'undefined' )
  {
    var error_file_prefix = 'captcha-google-rucaptcha-';
  }
  else
  {
    var error_file_prefix = 'captcha-google-';
  }

  if ( fs.existsSync( rootPath + '/' + error_file_prefix + 'number.txt' ) )
  {
    var captcha_number = fs.readFileSync( rootPath + '/' + error_file_prefix + 'number.txt' ) * 1 + 1;
  }
  else
  {
    var captcha_number = 1;
  }
  fs.writeFileSync( rootPath + '/' + error_file_prefix + 'number.txt', captcha_number + '' );
}

        captchaNumbers.parsing += 1;


console.log( 'start recaptcha solving' );


        let cookielist = await page.cookies();
        if ( cookielist.length > 0 )
        {
          this.cookies = [];
          for ( let i in cookielist )
          {
            this.cookies.push( cookielist[ i ][ 'name' ] + ':' +  cookielist[ i ][ 'value' ] );
          }
          this.cookies = this.cookies.join( ';', this.cookies );
        }

        const captchaCode = await captchaSolver.start(
          'recaptcha',
          {
            googlekey: captcha.sitekey,
            s: captcha.s,
            cookies: this.cookies,
            useragent: seoa.userAgent,
            pageurl: encodeURIComponent( captcha.continue_url )
          },
          { source: 'google' }
        );


//console.log( '\ngoogle recaptcha\n' );
//return 'stop';


if ( this.log )
{
  let t2 = new Date();
  //let d = ( ( t2.getTime() - t1.getTime() ) /	( 1000 * 60 ) ) . toFixed(2);
  let d = ( ( t2.getTime() - t1.getTime() ) /	1000 ) . toFixed( 0 );
  let fname = error_file_prefix + 'timelist-ipv4.txt';
  let timelist = '';

  if ( php.trim( _post[ 'proxy' ][ 'ipv6' ] ) )
  {
    fname = error_file_prefix + 'timelist-ipv6.txt';
  }

  if ( fs.existsSync( rootPath + '/' + fname ) )
  {
    timelist = php.trim( fs.readFileSync( rootPath + '/' + fname ) );
  }

  fs.writeFileSync( rootPath + '/' + fname, php.trim( timelist + '\n' + d ) );
}


        if ( typeof captchaCode != 'undefined' )
        {
          if ( await php.trim( captchaCode ) )
          {
//await console.log( '\n' + 'recaptcha complete: ' + captchaCode + '\n' );

            var cached_url = await page.url();


            await page.evaluate( ( captchaCode ) => {

              var $form = document.getElementById('captcha-form');
              if ( $form != null )
              {
                //$form = $captcha_field.closest('form');
                $form = document.querySelector('form')
              }

              $captcha_field = document.querySelector('[name="g-recaptcha-response"]');
              if ( $captcha_field != null )
              {
                $captcha_field.value = captchaCode;
              }
              else
              {
                let input = document.createElement( 'input' );
                input.type = 'hidden';
                input.name = 'g-recaptcha-response';
                input.value = captchaCode;
                $form.appendChild( input );
              }

              if ( typeof submitCallback != 'undefined' )
              {
                submitCallback( captchaCode );
              }
              else
              {
                var $button = $form.querySelector('input[type="submit"]');
                if ( $button != null )
                {
                  $form.querySelector('input[type="submit"]').click();
                }
                else
                {
                  $form.onsubmit = null;
                  $form.submit();
                }
              }
            }, captchaCode );


            var ci = 0;
            //while ( await page.url() == cached_url && ci <= 40 )
            while ( await page.url() == cached_url && ci <= 100 )
            {
              await page.waitForTimeout( 100 );
              ci++;
            }

            //не удалять, иначе буду ошибки при сборе данных хранилища и установки куки "UULE"
            await page.waitForTimeout( 2000 );

            captcha = await page.evaluate( () => {
              var captcha = null;

              var $recaptcha = document.getElementById('recaptcha');
              if ( $recaptcha != null )
              {
                captcha = {
                  sitekey: $recaptcha.dataset.sitekey,
                  s: $recaptcha.dataset.s,
                  continue_url: document.querySelector('input[name="continue"]').value
                };
              }

              return captcha;
            });





            if ( captcha
                  || await page.url() == cached_url
                  || /document\.getElementById\(\s*\'captcha\'\s*\)/.test( await page.content() ) )
            {
if ( this.log )
{
  if ( fs.existsSync( rootPath + '/' + error_file_prefix + 'error.txt' ) )
  {
    var captcha_error = fs.readFileSync( rootPath + '/' + error_file_prefix + 'error.txt' ) * 1 + 1;
  }
  else
  {
    var captcha_error = 1;
  }
  fs.writeFileSync( rootPath + '/' + error_file_prefix + 'error.txt', captcha_error + '' );
}

              //console.log( 'unicoder: remove profile_path' );
              console.log( "\n" + 'повторная рекапча' + "\n" );
              return 'stop';
            }
            else
            {
              if ( !this.setUULE )
              {
                if ( this.UULE )
                {
                  await page.setCookie({ 'name' : 'UULE', 'value' : this.UULE });
                }
                else
                {
                  await page.deleteCookie({ 'name' : 'UULE' });
                }

                this.setUULE = true;
                this.UULE_prev = this.UULE;

                await page.reload();
              }

              let i = 0;
              let selector_is_found = null;
              do
              {
                await page.waitForTimeout( 100 );
                i ++;

                try
                {
                  selector_is_found = await page.evaluate( ( wait_selector ) => {
                    return document.querySelector( wait_selector );
                  }, this.searchSelector );
                }
                catch ( error )
                {

                }
              }
              while ( selector_is_found === null && i <= 40 );


              await this.savePageCookies();


              console.log( '\n' + 'recaptcha is solved' );
              return true;
            }
          }
          else
          {
            console.log( "\n" + 'не решения рекапчи > 180 секунуд' + "\n" );
          }
        }
        else
        {
          console.log( "\n" + 'recaptcha code is undefined' + "\n" );
        }


        if ( await this.checkImageCaptcha( false ) == 'stop' )
        {
          return 'stop';
        }


        const error_403 = await page.evaluate( ( wait_selector, siteOptions ) => {
          if ( document.title.indexOf( 'Error 403' ) > -1 )
          {
            return 403;
          }
        });

        if ( error_403 )
        {
          console.log( 'page google=403' );
          return 'stop';
        }
      }
      else
      {
        /**
         * Блокировка IP Google
         */
        const ipLock = await page.evaluate( () => {
          const checkstr = 'but your computer or network may be sending automated queries. To protect our users, we can\'t process your request right now';
          if ( document.body.innerHTML.indexOf( checkstr ) > -1 )
          {
            return true;
          }
        });

        if ( ipLock )
        {
          console.log( 'page google=403' );
          return 'stop';
        }
        else
        {
          break;
        }
      }
    }


    if ( captcha !== null )
    {
      console.log( "\n" + 'повторная рекапча' + "\n" );
      return 'stop';
    }
  }



  async savePageCookies()
  {
    const page_cookies = JSON.stringify( await page.cookies() );
    fs.writeFileSync( seoa.profilePath + '/google-cookies.txt', page_cookies );

    /**
     * Возникают ошибки, если снимать позиции на домене отличном от .com
     * "Запрет доступа к хранилищу"
     */
    const session_storage = await page.evaluate( () => JSON.stringify( sessionStorage ) );
    fs.writeFileSync( seoa.profilePath + '/google-session-storage.txt', session_storage );

    const local_storage = await page.evaluate( () => JSON.stringify( localStorage ) );
    fs.writeFileSync( seoa.profilePath + '/google-local-storage.txt', local_storage );
  }
}

module.exports = google;
