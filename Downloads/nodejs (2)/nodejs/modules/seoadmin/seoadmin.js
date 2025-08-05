/**
 * Функции обработки заданий
 *
 * @package SerpHunt
 * @subpackage Core
 *
 * google-chrome-stable --headless --disable-audio-output --dump-dom https://serphunt.ru
 * список флагов chrome https://peter.sh/experiments/chromium-command-line-switches/
 * переход с Puppeteer на Playwright https://habr.com/ru/articles/594489/
 *
let t1 = performance.now();
let t1 = Math.floor( new Date().getTime() / 1000 );
console.log( 'page content: ' + ( performance.now() - t1 ) );
 *
 */


/**
 * Подключение библиотеки для работы с файлами
 */
const fs = require('fs');

class seoadmin
{
  constructor()
  {
    /**
     * Настройка переменных
     */
    this.fingerprint = null;
    this.userAgent = '';
    this.device = null;

    this.service = null;

    this.proxy_changed = false;

    this.captchaSearch = false;

    this.profilePath = false;
    this._pageContent = '';
  }

  /**
   * Настройки chrome
   */
  puppeteerOptions()
  {
    var options = {
      /**
       * Фоновый режим
       */
      headless: 'new',
      //headless: false,

      //slowMo: 10, //Замедляет операции Puppeteer на указанное количество миллисекунд, чтобы облегчить отладку.

      /**
       * Отключение рамеров браузера по умолчанию
       */
      defaultViewport: null,

      /**
       * Игнорировать ошибки сертификатов
       */
      ignoreHTTPSErrors: true,


      /**
       * Браузер открывается с панелью разработки
       */
      devtools: false,


      /**
       * Отключение сообщения,
       * что браузером управляет автоматизированное ПО
       */
      //ignoreDefaultArgs: [ '--enable-automation' ],

      args: [
        /**
         * Игнорировать ошибки сертификатов
         */
        '--ignore-certificate-errors',
        //'--ignore-certificate-errors-spki-list', используется с параметрами --ignore-certificate-errors-spki-list=jc7r1tE54FOO=


        /**
         * Отключение Same Origin Policy
         */
        '--disable-web-security',


        /**
         * Отключение различных уведомлений
         */
        //'--disable-notifications', //используется при обнаружении безголового режима https://intoli.com/blog/not-possible-to-block-chrome-headless/chrome-headless-test.html
        '--disable-push-api-background-mode',
        '--disable-network-portal-notification', //Disables notifications about captive portals in session ( Отключает уведомления о закрытых порталах в сеансе )
        '--ash-hide-notifications-for-factory', //Скрывает уведомления, не относящиеся к заводскому тестированию устройства Chrome OS, например обновления уровня заряда батареи
        '--disable-web-notification-custom-layouts', //Disables Web Notification custom layouts
        '--disable-device-discovery-notification', //Disables device discovery notifications ( Отключить уведомления об обнаружении устройств )
        '--disable-dev-shm-usage',


        /**
         * Отключение следа, который сообщает,
         * что браузером управляет автоматизированное ПО
         */
        '--disable-blink-features=AutomationControlled',
        '--reset-variation-state', //обнуляет X-Client-Data при новом запуске chrome


        /**
         * Настройки языка
         */
        '--lang=ru-RU',
        '--accept-lang=ru-RU',


        /**
         * Отключение песочницы
         */
        '--no-sandbox', //for debian
        '--disable-setuid-sandbox', //for debian


        /**
         * Отключает отправку отчетов об ошибках
         */
        '--disable-breakpad',
        '--disable-crash-reporter',


        /**
         * Отключение кэша

         //'--incognito', //ошибки
        '--disk-cache-dir=/dev/null',
        '--disk-cache-size=1',
        '--media-cache-size=1',
         */


        /**
         * Флаги, необходимые для закрытия фоновых процессов chrome после закрытия браузера
         * Также уменьшает количество процессов chrome
         * https://stackoverflow.com/questions/62220867/puppeteer-chromium-instances-remain-active-in-the-background-after-browser-disc
         */
        //'--single-process', //Запускает визуализатор и плагины в том же процессе, что и браузер. уменьшает потоки, но ВЫЗЫВАЕТ ОШИБКИ ( включается ниже )
                              //не запускается браузер на новых серверах serphunt
        //'--no-zygote', //Отключает использование процесса zygote для разветвления дочерних процессов, В WINDOWS ПОСЛЕ ЗАКРЫТИЯ БРАУЗЕРА ОСТАЮТСЯ ВИСЕТЬ ДВА ПРОЦЕССА

        '--no-experiments',
        '--no-first-run',
        //'--no-startup-window', //Не открывает автоматически окно браузера при запуске (используется при запуске Chrome для размещения фоновых приложений).
        '--no-pre-read-main-dll', //Должен ли этот процесс PrefetchVirtualMemory использовать содержимое Chrome.dll. Это разогревает страницы в памяти для ускорения запуска, но может не потребоваться в более поздних средствах визуализации и/или графическом процессоре. Информацию об эксперименте см. на crbug.com/1350257
        '--deterministic-fetch',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-site-isolation-trials',

        '--enable-low-end-device-mode', //облегченный режим для слабого устройства
        //'--renderer-process-limit=2', //это объединит все ваши расширения в один процесс и обеспечит использование одного процесса для всех вкладок ( ВЫЛЕТАЕТ БРАУЗЕР )
//'--no-mojo', //межпроцессорное взаимодействие


        /**
         * Другое
         */
        '--no-pings', //Отключение функции посылки запросов для проверки ссылок
        '--disable-audio-output', //ничего особо не дает
        '--disable-extensions', //ничего особо не дает
        '--enable-resource-prefetch',
        '--enable-nostate-prefetch',
        '--enable-simple-cache-backend',
        '--num-raster-threads=8',
        '--enable-spdy4',
        '--enable-font-cache-scaling',
        '--enable-parallel-downloadin',
        '--enable-fast-unload',

        '--enable-scroll-prediction',
        '--disable-accelerated-video-decode',
        '--disable-gpu',

        '--enable-experimental-canvas-features',
        '--enable-gpu-rasterization',
        '--ignore-gpu-blacklist',
        '--enable-zero-copy',

        '--back-forward-cache', //??

        '--enable-reader-mode',

        '--disable-adpf', //Отключает отчеты о синхронизации кадров через ADPF, даже если это поддерживается на устройстве.
        '--attribution-reporting-debug-mode', //Заставляет API отчетов об атрибуции работать без задержек и шума.

        '--disable-component-extensions-with-background-pages', //Отключить расширения компонентов по умолчанию для фоновых страниц — полезно для тестов производительности, когда эти страницы могут мешать результатам производительности.
        '--disable-timeouts-for-profiling', //Отключите таймауты, которые могут привести к зависанию браузера при медленной работе. Это полезно при работе с профилированием (например, отладкой malloc)
        '--disable-demo-mode', //Disables the Chrome OS demo.
        '--disable-default-apps', //Отключает установку приложений по умолчанию при первом запуске. Это используется во время автоматического тестирования.
        '--disable-databases', //Disables HTML5 DB support.
        '--hide-crash-restore-bubble', //Не отображается пузырь восстановления после сбоя при запуске браузера на этапе запуска системы в ChromeOS, если включена функция полного восстановления ChromeOS, поскольку отображается уведомление о полном восстановлении ChromeOS, позволяющее пользователю выбрать восстановление или нет.
      ]
    };


    if ( _post[ 'profile_path' ] != undefined )
    {
      _post[ 'profile_path' ] = _post[ 'profile_path' ].replace( /\/+$/, '' );
      options.userDataDir = _post[ 'profile_path' ];
      this.profilePath = options.userDataDir;

      try
      {
        fs.unlinkSync( options.userDataDir + '/SingletonLock' );
      }
      catch ( error )
      {
      }

/*
      if ( fs.existsSync( options.userDataDir + '/SingletonLock' ) )
      {
        fs.unlinkSync( options.userDataDir + '/SingletonLock' );
      }
*/


/*
      Копировались куки с обчыного браузера, чтобы были позиции как в обычном браузере.
      Так как они отличались от позиций в браузере, запускаемом в nodejs

      Спустя несколько месяцев ситуация сменилась на обратную, разность позиций стала при данных cookies.
      Копировались cookies, которые были созданны в начале ( несколько месяцев назад )
*/
      if ( _post[ 'handler' ].indexOf( 'yandex' ) > -1 && _post[ 'handler' ].indexOf( 'frequency' ) < 0 )
      {
        if( !fs.existsSync( _post[ 'profile_path' ] + '/Default' ) )
        {
          this.mkdirRecursive( _post[ 'profile_path' ] + '/Default' );
        }

        if ( fs.existsSync( _post[ 'profile_path' ] + '/Default/Cookies' ) )
        {
          fs.unlinkSync( _post[ 'profile_path' ] + '/Default/Cookies' );
        }

        //fs.copyFileSync( rootPath + '/nodejs/assets/profile/Cookies', _post[ 'profile_path' ] + '/Default/Cookies' );
      }
    }


    /**
     * Путь для профиля chrome

    if ( _post[ 'profile_path' ] != undefined )
    {
      options.userDataDir = _post[ 'profile_path' ].replace( /\/+$/, '' );

      this.profilePath = options.userDataDir;

      if( !fs.existsSync( options.userDataDir + '/counter.txt' ) )
      {
        this.mkdirRecursive( options.userDataDir );
        fs.writeFileSync( options.userDataDir + '/counter.txt', '1' );
      }
      else
      {
        var counter = fs.readFileSync( options.userDataDir + '/counter.txt' ).toString();
        counter ++;

        if ( counter <= 500 )
        {
          fs.writeFileSync( options.userDataDir + '/counter.txt', counter + '' );
        }
        else
        {
          this.rmdirRecursive( options.userDataDir );
        }
      }
    }
     */


    /**
     * Установка прокси
     */
    if ( _post.proxy != undefined && _post.proxy.ip != undefined )
    {
      options.args.push( '--proxy-server=' + _post.proxy.ip + ':' + _post.proxy.port );
    }



    //options[ 'headless' ] = false;
    if ( typeof seoa_test != 'undefined' )
    {
      options[ 'headless' ] = false;
    }

    if ( options[ 'headless' ] )
    {
       options.args.push( '--window-position=-2400,-2400' ); //в противном случае открывается новое окно в новых chrome
    }



    /**
     * Отключение фонового режима для тестирования
     */
    if ( /\.serphunt$/.test( serverName ) )
    {
      //Папка с программами установленных puppeteer - C:\Users\DWJ9y\.cache\puppeteer

      options[ 'executablePath' ] = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
      //options[ 'executablePath' ] = 'C:/Users/DWJ9y/AppData/Local/Yandex/YandexBrowser/Application/browser.exe';
      //options[ 'userDataDir' ] = 'C:/Users/DWJ9y/AppData/Local/Google/Chrome/User Data';
    }
    else
    {
      //ls -l /usr/bin/google-chrome-stable : /opt/google/chrome/google-chrome
      //ls -l /usr/bin/google-chrome : /etc/alternatives/google-chrome

      //Запускает визуализатор и плагины в том же процессе, что и браузер. уменьшает потоки, но ВЫЗЫВАЕТ ОШИБКИ
      //options.args.push( '--single-process' ); //не запускается браузер на новых серверах serphunt
      options.args.push( '--no-zygote' );

      options[ 'executablePath' ] = '/opt/google/chrome/chrome';
      //++options[ 'executablePath' ] = '/opt/google/chrome/google-chrome'; //stable
      //options[ 'executablePath' ] = '/etc/alternatives/google-chrome';

      //options[ 'userDataDir' ] = '/home/admin/.config/google-chrome/';
      //options[ 'userDataDir' ] = '/tmp/puppeteer-serphunt-test/chrome-profile';
    }


    return options;
  }


  mkdirRecursive( dir )
  {
    if ( fs.existsSync( dir ) )
    {
      return true;
    }

    const dirname = path.dirname( dir )
    this.mkdirRecursive( dirname );
    fs.mkdirSync( dir ) ;
  }


  rmdirRecursive( path )
  {
    if( fs.existsSync( path ) )
    {
      fs.readdirSync( path ).forEach( function( file, index )
      {
        var curPath = path + '/' + file;
        if ( fs.lstatSync( curPath ).isDirectory() )
        {
          seoa.rmdirRecursive( curPath );
        }
        else
        {
          fs.unlinkSync( curPath );
        }
      });

      fs.rmdirSync( path );
    }
  }



  /**
   * Авторизация прокси
   */
  async proxyAuth()
  {
    if ( _post.proxy != undefined && _post.proxy.userpwd != undefined )
    {
      var userpwd = /^([^\:]+):([^\:]+)$/.exec( _post.proxy.userpwd );
      if ( userpwd != null )
      {
        await page.authenticate( { username: userpwd[1], password: userpwd[2] } );
      }
    }
  }


  /**
   * Перезагрузка браузера
   */
  async browserReload()
  {
    if ( browser )
    {
      browser.close();
    }

    browser = await puppeteer.launch( seoa.puppeteerOptions() );
    page = await browser.newPage();

    /**
     * Авторизация прокси
     */
    await seoa.proxyAuth();

    /**
     * Настройка юзерагента
     */
    if ( typeof _post[ 'device' ] != 'undefined' )
    {
      await seoa.setFingerprint( _post[ 'device' ] );
    }
    else
    {
      await seoa.setFingerprint();
    }

    /**
     * Контроль загрузки файлов
     */
    await seoa.setRequestInterception();

    google.searchURL = null;
    google.lastSearchPage = null;

    yandex.searchURL = null;
    yandex.lastSearchPage = null;
    yandex.resultsNumberIsSetted = false;
  }


  /**
   * Смена прокси
   *
   * @param string service Сервис: yandex или google. Опционально
   */
  async changeProxy( service )
  {
    this.proxy_changed = false;

    /**
     * Определение сервиса, если он не задан
     */
    if ( typeof service === 'undefined' )
    {
      if ( _post.handler.indexOf( 'google' ) > -1 )
      {
        service = 'google';
      }
      else if ( _post.handler.indexOf( 'yandex' ) > -1 )
      {
        service = 'yandex';
      }
      else if ( _post.handler.indexOf( 'keywords-frequency' ) > -1 )
      {
        service = 'yandex';
      }
      else if ( _post.handler = 'competitors' )
      {
        service = 'yandex';
      }
      else
      {
        service = false;
      }
    }
    else if ( php.trim( this.service ) )
    {
      service = this.service;
    }
    else
    {
      service = 'yandex';
    }

    var lockPath = rootPath + '/tmp/' + serverName + '/locks/proxy-' + service;
    var t1 = Math.floor( new Date().getTime() / 1000 );
    while ( Math.floor( new Date().getTime() / 1000 ) - t1 < 5 )
    {
      try
      {
        await fs.mkdirSync( lockPath, { recursive: true });
        break;
      }
      catch ( error )
      {
        await php.sleep( 100 );
      }
    }


    const [ dbrows, dbfields ] = await promisePool.query( `
      SELECT *
      FROM seoa_proxy
      WHERE
        ` + service + `_used < DATE_SUB( NOW(), INTERVAL 60 SECOND )
          AND
        ` + service + `_unlock_time < NOW()
      ORDER BY ` + service + `_used ASC
      LIMIT 1
    ` );

    if ( dbrows.length > 0 )
    {
      _post.proxy = dbrows[ 0 ];

      _post[ 'profile_path' ] = _post[ 'profile_path' ].replace( /\/(puppeteer(?:-test)?)\/.*$/, '/$1' );
      _post[ 'profile_path' ] +=
        '/' + md5( _post.proxy.proxy_key + service )
        +  '/' + md5( seoa.userAgent );

      seoa.proxy_changed = true;

      await promisePool.query( `
          UPDATE seoa_proxy
          SET
            ` + service + `_task = "` + _post.thread_id + `",
            ` + service + `_used = NOW(),
            ` + service + `_delay = NOW()
          WHERE proxy_key = "` + _post.proxy.proxy_key + `"
      ` );

      fs.rmdirSync( lockPath );
    }
    else
    {
      fs.rmdirSync( lockPath );
    }


    await page.waitForTimeout( 100 );

    if ( seoa.proxy_changed  )
    {
      await this.browserReload();
    }
    else
    {
      await page.waitForTimeout( 20 * 1000 );
    }
  }


  /**
   * Подготовка URL для cравнения
   *
   * @param string url
   *
   * @return string
   */
  urlToCompare( url )
  {
    /*
      url = decodeURIComponent( url );
      ошибка "URIError: malformed URI sequence" при обработке урл типа
      https://www.zakazkrovli.ru/catalog/cherdachnye_lestnitsy_fakro/filter/tol_utepl-is-60+%EC%EC/apply/
    */

    if ( typeof url === 'undefined' )
    {
      return '';
    }

    url = url.toLowerCase();
    url = url.replace( /^(https?:)?\/\/((www|m)\.)?/, '' );
    url = url.replace( '/www.', '/' );
    url = url.replace( '/m.', '/' );
    url = url.replace( /^\/+/, '/' );

    if ( php.trim( siteOptions[ 'positions_with_subdomains' ] ) )
    {
      if ( /^[^\.\/]+\.[^\.\/]+\.[^\.\/]+$/.test( siteOptions[ 'positions_with_subdomains' ] ) )
      {
        url = url.replace( /^(\/?)[^\.\/]+\.([^\.\/]+\.[^\.\/]+\.[^\.\/]+)(\/|$)/, '$1$2$3', url );
      }
      else
      {
        url = url.replace( /^(\/?)[^\.\/]+\.([^\.\/]+\.[^\.\/]+)(\/|$)/, '$1$2$3', url );
      }
    }

    if ( /^[^\/]+\/$/.test( url ) )
    {
      url = url.replace( /\/$/, '' );
    }

    if ( /^[^\/]+\/$/.test( url ) )
    {
      url = '/' + url;
    }
    else if ( !/^\//.test( url ) )
    {
      if ( url.indexOf( '/' ) < 0 )
      {
        url += '/';
      }

      url = '/' + url;
    }

    return url;
  }


  /**
   * Сравнение двух URL
   *
   * @param string url_1 URL сайта, по которому идет снятие позиций
   * @param string url_2 URL из результатов поиска
   * @param string url_2 позиция url_2 в результатах поиска
   *
   * @return object
   */
  checkUrlMatching( url_1, url_2, position, incomplete_match, without_domain_matches )
  {
    if ( typeof position === 'undefined' )
    {
      position = true;
    }

    if ( typeof incomplete_match === 'undefined' )
    {
      incomplete_match = false;
    }

    if ( typeof incomplete_match === 'undefined' )
    {
      without_domain_matches = false;
    }

    var result = {
      found: false,
      wrong_urls: {}
    };

    if ( url_2 == undefined || url_2 == null )
    {
      return result;
    }

    if ( url_1.indexOf( '?' ) > -1 && url_2.indexOf( '?' ) < 0 )
    {
      return result;
    }

    var domain_1 = seoa.siteDomain( url_1 );
    var prepared_url_1 = seoa.urlToCompare( url_1 );
    var prepared_url_2 = seoa.urlToCompare( url_2 );

    var domainRegexp = new RegExp( '^(https?:)?\/?\/?((www|m)\.)?' + php.pregQuote( domain_1 ), 'i' );

    let _end = '$';
    if ( incomplete_match )
    {
      _end = '';
    }

    try
    {
      var decoded_url_1 = decodeURIComponent( prepared_url_1 );
      var regexp_3 = new RegExp( php.pregQuote( decoded_url_1, '/' ) + '(\\?[^\/]+)?' + _end, 'i' );
    }
    catch ( error )
    {
      var decoded_url_1 = false;
      var regexp_3 = false;
    }

    var regexp_1 = new RegExp( php.pregQuote( prepared_url_2, '/' ) + '(\\?[^\/]+)?' + _end, 'i' );
    var regexp_2 = new RegExp( php.pregQuote( prepared_url_1, '/' ) + '(\\?[^\/]+)?' + _end, 'i' );

    var urlMatch =
      regexp_1.test( prepared_url_1 )
        ||
      regexp_2.test( prepared_url_2 )
        ||
      ( decoded_url_1 && regexp_1.test( decoded_url_1 ) )
        ||
      ( regexp_3 && regexp_3.test(  prepared_url_2 ) );

    if ( urlMatch )
    {
      result.found = position;
    }
    else if ( !without_domain_matches && domainRegexp.test( url_2 ) )
    {
      result.wrong_urls[ url_2 ] = position;
    }

    return result;
  }


  /**
   * Извлечение домена сайта из URL
   *
   * @param string url
   *
   * @return string
   */
  siteDomain( url, level )
  {
    var domain = /^(?:https?:)?(?:\/\/?)?(?:(?:www|m)\.)?([^\/\?]+)/.exec( url );
    if ( domain != null )
    {
      if ( typeof level != undefined )
      {
        var r = new RegExp( '([^\.]+\.?){' + level + '}$' );
        var domain_level = r.exec( domain[1] );
        if ( domain_level != null )
        {
          return domain_level[0];
        }
        else
        {
          return domain[1];
        }
      }
      else
      {
        return domain[1];
      }
    }

    return url;
  }


  /**
   * Подключение обработчика
   *
   * @param string handler Названиие обработчика
   */
  async handler( handler )
  {
    if ( fileExists( './handlers/' + handler + '.js' ) )
    {
      const handlerFunction = require( './handlers/' + handler + '.js' );
      return handlerFunction();
    }
  }


  /**
   * Обновление контрольного времени выполнения задания
   *
   * @param string service Сервис: yandex или google. Опционально
   */
  async updateTaskExecutionTime( service )
  {
    /**
     * Определение сервиса, если он не задан
     */
    if ( typeof service === 'undefined' || !php.trim( this.service ) )
    {
      if ( _post.handler.indexOf( 'google' ) > -1 )
      {
        var service = 'google';
      }
      else if ( _post.handler.indexOf( 'yandex' ) > -1 )
      {
        var service = 'yandex';
      }
      else if ( _post.handler.indexOf( 'keywords-frequency' ) > -1 )
      {
        var service = 'yandex';
      }
      else if ( _post.handler = 'competitors' )
      {
        var service = 'yandex';
      }
      else
      {
        var service = false;
      }
    }
    else if ( php.trim( this.service ) )
    {
      var service = this.service;
    }


    /**
     * Обновление контрольного времени выполнения задания
     */
    await promisePool.query( `
      UPDATE seoa_tasks
      SET task_updated = NOW()
      WHERE task_id = "` + _post.task_id + `"
    ` );


    /**
     * Обновление контрольного времени многопоточного режима
     */
    var control_file = rootPath + '/tmp/' + serverName + '/control/pthreads-cron';

    if ( _post[ 'TASK_TEST' ] != undefined )
    {
      control_file += '-test';
    }

    fs.writeFileSync( control_file, '1' );


    /**
     * Обновление контрольного времени использования прокси
     */
    if ( service )
    {
      if ( _post.proxy != undefined )
      {
        await promisePool.query( `
          UPDATE seoa_proxy
          SET
            ` + service + `_task = "` + _post.thread_id + `",
            ` + service + `_used = NOW(),
            ` + service + `_delay = NOW()
          WHERE proxy_key = "` + _post.proxy.proxy_key + `"
        ` );
      }

      /**
       * Обновление контрольного времени использования сервисных аккаунтов
       */
      if ( _post.account != undefined )
      {
        await promisePool.query( `
          UPDATE seoa_service_accounts
          SET
            task_id = "` + _post.thread_id + `",
            used = NOW()
          WHERE
            account_key = "` + _post.account.account_key + `"
        ` );
      }
    }
  }


  /**
   * Настройка отпечатка браузера
   *
   * @param string device Устройство: ПК или телефон
   */
  async setFingerprint( device, force )
  {
//return false;

    if ( typeof device == 'undefined' || device == 'desktop' )
    {
      seoa.userAgent = await browser.userAgent();
      this.device = 'desktop';

      return false;
    }


    if ( device == 'mobile' )
    {
      this.device = 'mobile';

      if ( seoa.userAgent.indexOf( 'Mobile Safari' ) < 0 )
      {
        seoa.userAgent = await browser.userAgent();
        seoa.userAgent = seoa.userAgent.replace( 'Safari/', 'Mobile Safari/' ) + '  OPX/2.2';

        await page.setUserAgent( seoa.userAgent );
        //console.log( await page.evaluate( 'navigator.userAgent' ) );
      }

      return false;
    }



    device = typeof device !== 'undefined' ? device : 'desktop';

    if ( this.device != device || typeof force != 'undefined' )
    {
/**
 * Для мобильных, отпечаток, где присутствует обычная постраничная навигация

    IPOD
    browsers: [ 'safari' ],
    screen: { minWidth: 500 }

    IPHONE ( сначала подобрать соотвествующий отпечаток, потом в нем заменить данные )
    browserFingerprintWithHeaders[ 'fingerprint' ][ 'navigator' ][ 'appVersion' ] = '6.0 ' + ua,
    browserFingerprintWithHeaders[ 'fingerprint' ][ 'navigator' ][ 'userAgent' ] = ua,
    browserFingerprintWithHeaders[ 'headers' ][ 'user-agent' ] = ua,

*/
      const { FingerprintGenerator } = require( 'fingerprint-generator' );
      const { FingerprintInjector }  = require( 'fingerprint-injector' );


      let fingerprint_options = {
        devices: [ device ],
        locales: [ 'ru-RU', 'ru' ],
        //browserListQuery - список по проценту пользования и типам: современные, стабильные, устаревшие https://github.com/browserslist/browserslist#full-list
        //devices: [ 'desktop', 'mobile' ],
        //browsers: [ 'firefox', 'chrome', 'safari', 'edge' ],
        //browsers: [ 'safari' ],
        //browsers: [ 'firefox' ],
        //browsers: [ 'chrome' ],
        //browsers: [ {name: "firefox", minVersion: 80}, { name: "chrome", minVersion: 87 } ],
        //operatingSystems: [ 'linux', windows', 'macos', 'android', 'ios' ],
        //operatingSystems: [ 'linux' ],
        //operatingSystems: [ 'android' ],
        //operatingSystems: [ 'windows' ],
        //screen: { maxHeight: number; maxWidth: number; minHeight: number; minWidth: number },
        //'httpVersion' : '2'
      };

/*
      if ( device == 'desktop' )
      {
        fingerprint_options[ 'operatingSystems' ] = [ 'linux' ];
        fingerprint_options[ 'browsers' ] = [ 'chrome' ];
      }
      else
      {
        fingerprint_options[ 'operatingSystems' ] = [ 'android' ];
        fingerprint_options[ 'browsers' ] = [ 'chrome' ];
      }
*/

//console.log( fingerprint_options );

      const fingerprintGenerator = new FingerprintGenerator( fingerprint_options );

      let browserFingerprintWithHeaders = null;

      browserFingerprintWithHeaders = await fingerprintGenerator.getFingerprint();

//browserFingerprintWithHeaders[ 'fingerprint' ][ 'screen' ][ 'devicePixelRatio' ] = 1;
//console.log( browserFingerprintWithHeaders );

      /*
       * тестовый отпечаток, если не задан сгенерированный
       *
      if ( !browserFingerprintWithHeaders )
      {
        browserFingerprintWithHeaders = fs.readFileSync( 'D:/___profiles/profile.json' ).toString();
        browserFingerprintWithHeaders = JSON.parse( browserFingerprintWithHeaders );
      }
      */

      const fingerprintInjector = new FingerprintInjector();
      await fingerprintInjector.attachFingerprintToPuppeteer( page, browserFingerprintWithHeaders );

      this.fingerprint = browserFingerprintWithHeaders;

      this.userAgent = browserFingerprintWithHeaders[ 'fingerprint' ][ 'navigator' ][ 'userAgent' ];
      this.device = device;
console.log( this.userAgent );
    }
  }


  /**
   * Задержка запроса
   *
   * @param string service Сервис: yandex или google
   * @param string query Поисковый запрос
   */
  async delay( service, query )
  {
    return false;

    query = typeof query !== 'undefined' ?  query : '';

    if ( [ 'yandex', 'google' ].indexOf( service ) > -1 )
    {
      if ( query.indexOf(':') > -1 )
      {
        var delayKey = service + '_with_operators';
      }
      else
      {
        var delayKey = service;
      }
    }
    else
    {
      var delayKey = service;
    }

    if ( seoaOptions['delay'][delayKey] != undefined )
    {
      var min = seoaOptions['delay'][delayKey]['min'] * 1;
      var max = seoaOptions['delay'][delayKey]['max'] * 1;

      if ( min > max )
      {
        min = max;
      }

      if ( min >= 0 && max > 0 )
      {
        var delayTime = Math.floor(Math.random() * (max - min + 1)) + min;

        if ( delayTime > 0 )
        {
          await console.log( 'delay ' + delayTime + ' seconds' );
          await page.waitForTimeout( delayTime * 1000 );
        }
      }
    }
  }


  /**
   * Контроль загрузки файлов Яндексом
   */
  yandexRequestProcessing( request )
  {
/*
    if ( request.url().indexOf( 'captchapgrd' ) > -1 )
    {
      request.abort();
    }
    else
*/
    if ( request.url().indexOf( 'captcha' ) > -1 )
    {
      if ( /^https:\/\/(www\.)?captcha-backgrounds.*?background\.jpg$/i.test( request.url() )
            //|| !php.inArray( request.resourceType(), [ 'document', 'image' ] ) )
            || !php.inArray( request.resourceType(), [ 'document', 'image', 'stylesheet' ] ) ) //без stylesheet не работает slider captcha
            //|| php.inArray( request.resourceType(), [ 'xhr', 'ping', 'font' ] ) )
      {
        if ( php.inArray( request.resourceType(), [ 'script' ] ) )
        {
          if ( /\/(captcha_smart|captcha_smart_react)\./i.test( request.url() ) )
          {
            request.continue();
          }
          else
          {
            //console.log( request.url() );
            request.continue();
            //request.abort(); //не работает slider captcha
          }
        }
        else
        {
          request.abort();
        }
      }
      else
      {
        request.continue();
      }
    }
    else if ( !php.inArray( request.resourceType(), [ 'document' ] ) )
    //else if ( php.inArray( request.resourceType(), [ 'xhr', 'ping', 'font', 'stylesheet' ] ) )
    {
//console.log( request.url() );
      request.abort();
    }
    else if ( /^https:\/\/(www\.)?yandex\.[^\/]+\/?(search\/(touch\/)?)?(\?.*)?$/i.test( page.url() ) )
    {
      //if ( php.inArray( request.resourceType(), [ 'fetch', 'font', 'stylesheet' ] ) )
      if ( php.inArray( request.resourceType(), [ 'fetch', 'font' ] ) )
      {
        request.abort();
      }
      else if ( request.resourceType() == 'xhr' )
      {
        request.abort();
      }
      else if ( request.resourceType() == 'xhr'
                && !/^https:\/\/(www\.)?yandex\.[^\/]+\/?(search\/(touch\/)?)?(\?.*)?$/i.test( request.url() )
                //&& request.url().indexOf( '/result/touch' ) < 0
                //&& request.url().indexOf( '/clck/safeclick/' ) < 0
                //&& request.url().indexOf( '.txt' ) < 0
                //&& request.url().indexOf( '/ick/r' ) < 0
                //&& request.url().indexOf( 'zen.yandex' ) < 0
                && request.url().indexOf( '.css' ) < 0 )
                //&& request.url().indexOf( '.js' ) < 0 )
      {
        request.abort();
      }


/*
      else if ( request.resourceType() == 'other' )
      {
        //if ( /(\/watch\/\d+\?)|(\/safeclick\/)|(\/iconostasis\/)|(\/cli?ck\/(counter|click))/i.test( request.url() ) )
        if ( /(\/watch\/\d+\?)|(\/iconostasis\/)|(\/cli?ck\/(counter|click))/i.test( request.url() ) )
        {
          request.abort();
        }
        else
        {
          //console.log( request.resourceType() + ' | ' + request.url()  );
          request.continue();
        }
      }
*/
      else if ( request.resourceType() == 'image' )
      {
        request.abort();
/*
        //|((yabs|awaps)\.yandex)
        //if ( /(\.(svg|gif|png|jpg)$)|(\/instant\/log)|(\/portal\/set\/)|(\/safeclick\/)|((yabs|awaps)\.yandex)|(\/clck\/click\/reqid\=)|(\/avatars\.mds\.)|((\/favicon|im\d*-tub-\w+)\.yandex\.)|(data\:image\/)/i.test( request.url() ) )
        //if ( /(\.(svg|gif|png|jpg)$)|(\/mc\.)|(\/instant\/log)|(\/portal\/set\/)|((yabs|awaps)\.yandex)|(\/clck\/click\/reqid\=)|(\/avatars\.mds\.)|((\/favicon|im\d*-tub-\w+)\.yandex\.)|(data\:image\/)/i.test( request.url() ) )
        if ( /(\.(svg|gif|png|jpg)$)|(\/mc\.)|(\/instant\/log)|(\/portal\/set\/)|(\/avatars\.mds\.)|((\/favicon|im\d*-tub-\w+)\.yandex\.)|(data\:image\/)/i.test( request.url() ) )
        {
          request.abort();
        }
        else
        {
          //console.log( request.resourceType() + ' | ' + request.url()  );
          request.continue();
        }
*/
      }
      else if ( request.resourceType() == 'document' )
      {
        if ( !/^https:\/\/(www\.)?yandex\.[^\/]+\/?(search\/(touch\/)?)?(\?.*)?$/i.test( request.url() ) )
        {
          request.abort();
        }
        else
        {
          //console.log( request.resourceType() + ' | ' + request.url()  );
          request.continue();
        }
      }
      else if ( request.resourceType() == 'script' )
      {
//|(\/yastatic\.[^./]+\/www\/)
        //if ( /(\/safeclick\/)|((yabs|awaps)\.yandex)|(\/zen-lib\/)|(\/metrika\/)|(\/watch\/\d+\?)|(google)/i.test( request.url() ) )
        if ( /(\/yastatic\.[^./]+\/react\/)|(\/yastatic\.[^./]+\/www\/)|((yabs|awaps)\.yandex)|yandcache|(\/zen-lib\/)|(\/metrika\/)|(\/watch\/\d+\?)|(google)/i.test( request.url() ) )
        {
          request.abort();
        }
        else
        {
          //console.log( request.resourceType() + ' | ' + request.url()  );
          request.continue();
        }
      }
      else
      {
        //console.log( request.resourceType() + ' | ' + request.url()  );
        request.continue();
      }
    }
    else
    {
      //console.log( request.resourceType() + ' | ' + request.url()  );
      request.continue();
    }
  }




  /**
   * Контроль загрузки файлов
   * Блокирует загрузку некоторых файлов для ускорения работы
   */
  async setRequestInterception()
  {
    if ( _post.handler.indexOf( '-google' ) > -1 )
    {
      await page.setRequestInterception( true );

      page.on('request', request => {
/*
        if ( /\.gstatic\.com\/images\?q=tbn/gi.test( request.url() ) )
        {
          request.abort();
        }
        else
        {
          request.continue();
        }
*/

        if ( /favicon\.ico/ig.test( request.url() ) )
        {
          request.abort();
        }
        else if ( /\/\/(www\.)?google\.[^\/]+\/sorry\/index/.test( page.url() ) )
        {

          if ( php.inArray( request.resourceType(), [ 'script' ] ) )
          //if ( /api\.js/.test( request.url() ) )
          {
            request.abort();
            //request.continue();
          }
          else if ( /^https:\/\/(www\.)?google\.[^\/]+\/recaptcha\/api\d*\/(anchor|fallback)/i.test( request.url() ) )
          {
            request.abort();
            //request.continue();
          }
          else
          {
            request.continue();
          }
        }
        else if ( /font|image|object|media/.test( request.resourceType() ) )
        {
          request.abort();
        }
        else if ( /(play\.google\.com|googleapis\.com|apis\.google\.com|gstatic\.com|\/gen_[0-9]+?|\/xjs\/)/ig.test( request.url() ) )
        {
          request.abort();
        }
        else
        {
//console.log( request.url() + "\n" );
          request.continue();
        }
      });
    }
    else if ( [ 'keywords-position-yandex', 'snippets-yandex', 'competitors' ].indexOf( _post.handler ) > -1 )
    {
      await page.setRequestInterception( true );

      page.on('request', request => {
        this.yandexRequestProcessing( request );
        //request.continue();
      });

      /**
       * Необходимо для редиректа на страницу капчи в мобильной выдаче
       */
      page.on( 'dialog', ( dialog ) => {
        dialog.accept();
      });
    }
    else if ( [ 'indexing-yandex' ].indexOf( _post.handler ) > -1 )
    {
      await page.setRequestInterception( true );

      page.on('request', request => {
        if ( page.url().indexOf( 'hghltd.yandex' ) > -1 )
        {
          if ( !/(yandex)|(hghltd\.yandex\.)|(\/search\/copy\?)/i.test( request.url() )
                ||
              /(counter\.yadro)|(\/vk\.com)/i.test( request.url() ) )
          {
            request.abort();
          }
          else
          {
            //console.log( request.resourceType() + ' | ' + request.url()  );
            request.continue();
          }
        }
        else
        {
          //request.continue();
          this.yandexRequestProcessing( request );
        }
      });
    }
    else if ( [ 'keywords-frequency', 'cookies-yandex' ].indexOf( _post.handler ) > -1 )
    {
      await page.setRequestInterception( true );

      page.on('request', request => {
        if ( /(mc\.yandex\.)|(\/log-js\/render\/)|(\/registered\/main\.pl$)/g.test( request.url() ) )
        {
          request.abort();
        }
        else if ( /font|image|object|media/.test( request.resourceType() ) )
        {
          if ( request.url().indexOf( 'captcha' ) < 0 )
          {
            request.abort();
          }
          else
          {
            request.continue();
          }
        }
        else
        {
          request.continue();
        }
      });
    }
  }



  async pageLoad( url, wait_selector, window_stop )
  {
    const cached_url = await page.url();
    this._pageContent = '';


    try
    {
      await page.setBypassCSP( true );
    }
    catch ( error )
    {

    }


    if ( typeof window_stop === 'undefined' )
    {
      window_stop = true;
    }


    //let wait_max = 15;
    let wait_max = 30;
    if ( url.indexOf( 'direct.yandex' ) )
    {
      wait_max = 45;
    }


    let timeout = 500; //не хватает на мобильной прокси

    if ( typeof _post[ 'proxy' ][ 'mobile' ] != 'undefined' && _post[ 'proxy' ][ 'mobile' ] > 0 )
    {
      //timeout = 3000; //1000
      timeout = 500;
    }


    if ( php.inArray( _post[ 'handler' ], [ 'keywords-frequency' ] ) )
    {
      timeout = 10000;
      window_stop = false;
    }
    else if ( _post[ 'handler' ].indexOf( 'google' ) > -1 )
    {
      timeout = 1500;
      //wait_max = 45;
      //window_stop = false;
    }

//window_stop = false;
//timeout = 3000;

    try
    {
      await page.goto( url, {
        'timeout' : timeout, //меньше 300 не делать, ошибки загрузки контента

        'waitUntil' : 'networkidle2' //при таком варианте, когда открывается пустая страница, процесс виснет
        //'waitUntil': 'domcontentloaded'
      });
    }
    catch ( error )
    {
      error = error.toString();

      if ( error.indexOf( 'net::ERR_EMPTY_RESPONSE' ) > -1 && typeof wait_selector != 'undefined' ) //бывает у яндекса
      {
        //await page.waitForTimeout( 100 );

        if ( await page.$( wait_selector ) === null )
        {
          await page.goto( url, {
            'timeout' : timeout, //меньше 300 не делать, ошибки загрузки контента

            'waitUntil' : 'networkidle2' //при таком варианте, когда открывается пустая страница, процесс виснет
            //'waitUntil': 'domcontentloaded'
          });
        }
      }
      else if ( error.indexOf( 'TimeoutError: Navigation timeout' ) < 0
                && error.indexOf( 'Execution context was destroyed, most likely because of a navigation' < 0 ) )
      {
        await seoa.errorProcessing( error );
        return false;
      }
    }


    if ( typeof wait_selector !== 'undefined' )
    {
      let i = 0;
      do
      {
        try
        {
          this._pageContent = await page.evaluate( ( wait_selector, winstop ) => {
            if ( document.querySelector( wait_selector ) !== null )
            {
              let window_stop = winstop;

              const non_stop_regexp = new RegExp(
                //'(direct\.yandex\.ru\/registered\/main\.pl)|(\/showcaptcha\?)',
                //'(direct\.yandex\.ru\/registered\/main\.pl)|(passport\.yandex\.ru\/(challenge|auth|showcaptcha))|(sso\.passport\.yandex\.ru)|(sso.ya.ru)',
                '(direct\.yandex\.ru\/registered\/main\.pl)|(passport\.yandex\.ru\/(challenge|auth|showcaptcha))|(sso\.passport\.yandex\.ru)',
                'g'
              );


              if ( non_stop_regexp.test( document.location.href ) )
              {
                window_stop = false;
              }

              if ( window_stop )
              {
                if ( /\/showcaptcha\?/g.test( document.location.href ) )
                {
                  const $checkbox_captcha = document.querySelector( '.CheckboxCaptcha-Button' );
                  if ( $checkbox_captcha !== null )
                  {
                    return 'wait-captcha-checkbox';
                  }

                  const $slider_captcha = document.querySelector( '.CaptchaSlider' );
                  if ( $slider_captcha !== null )
                  {
                    return 'wait-captcha-slider';
                  }
                }
                else if ( /\/yandex\.[^\/]+\/search\/(touch\/)?\?text=/g.test( document.location.href ) )
                {
                  const $serpitem = document.querySelector( '.serp-item' );
                  if ( $serpitem === null )
                  {
                    return 'wait-results';
                  }
                }

                window.stop();
              }


              document.readyState = 'complete';
              return document.documentElement.outerHTML;
            }
            else if ( /^(\w+\.)?google\./.test( location.hostname ) && document.title.indexOf( 'Error 403' ) > -1 )
            {
              document.readyState = 'complete';
              return document.documentElement.outerHTML;
            }
            else
            {
              return null;
            }
          }, wait_selector, window_stop );


          if ( php.inArray( this._pageContent, [ 'wait-captcha-checkbox', 'wait-captcha-slider', 'wait-results' ] ) )
          {
            if ( this._pageContent == 'wait-results' )
            {
              await page.waitForTimeout( 1000 );
            }
            if ( this._pageContent == 'wait-captcha-slider' )
            {
              //await page.waitForTimeout( 2000 );
            }
            else
            {
              //await page.waitForTimeout( 500 );
            }


            this._pageContent = await page.evaluate( () => {
              //window.stop();
              document.readyState = 'complete';
              return document.documentElement.outerHTML;
            });
          }
        }
        catch ( error )
        {
          error = error.toString();

          if ( error.indexOf( 'Execution context was destroyed, most likely because of a navigation' ) > -1 )
          {
            this._pageContent = null;
            await page.waitForTimeout( 100 );
            i++;

            continue;
          }
          else
          {
            console.log( error );
          }
        }

        if ( !this._pageContent )
        {
          await page.waitForTimeout( 100 );
          i++;
        }
        else if ( /<\/(span|div|p)>/.test( this._pageContent ) )
        {
/*
          this._pageContent += '';

          if ( !/<\/(span|div|p)>/.test( this._pageContent ) )
          {
            await page.waitForTimeout( 500 );
          }
*/

          break;
        }
      }
      while ( this._pageContent === null && i <= wait_max );
    }
    else
    {
      await page.waitForTimeout( 1000 );

      if ( !/<\/(span|div|p)>/.test( await page.content() ) )
      {
        await page.waitForTimeout( 1000 );
      }

      if ( !/<\/(span|div|p)>/.test( await page.content() ) )
      {
        await page.waitForTimeout( 500 );
      }
    }

//await page.waitForTimeout( 5000 );
    if ( this._pageContent )
    {
      this._pageContent += '';
      return true;
    }
    else
    {
      console.log( 'Error: net::ERR_PROXY_CONNECTION_FAILED : force' );
      return false;
    }
  }



  async action( action, action_selector, wait_selector )
  {
    const cached_url = await page.url().replace( /%20/g, '+' );
    this._pageContent = '';

    for ( let n = 0; n <= 1; n++ )
    {
      try
      {
        if ( await page.$( action_selector ) === null )
        {
          break;
        }
      }
      catch ( error )
      {
        break;
      }


      if ( action == 'click' )
      {
        await this.mouseClick( action_selector );
/*
        await page.focus( action_selector );
        await page.hover( action_selector );
        //await page.tap( action_selector ); //не прокликивается пагинация на desktop в яндексе
        await page.click( action_selector );
*/
      }
      else
      {
        await page.evaluate( ( action_selector ) => {
          document.body.querySelector( action_selector ).submit();
        }, action_selector );
      }


      let i = 0;
      let current_url = await page.url().replace( /%20/g, '+' );

//console.log( '' ); console.log( '' ); console.log( cached_url ); console.log( current_url ); console.log( '' );

      while ( current_url == cached_url && i <= 10 ) //i <= 20
      {
        current_url = await page.url().replace( /%20/g, '+' );

        if ( current_url == cached_url )
        {
          await page.waitForTimeout( 100 );
          i++;
        }
        else
        {
          break;
        }
      }

//console.log( cached_url ); console.log( current_url ); console.log( '' ); console.log( '' );

      if ( current_url != cached_url )
      {
        //let wait_max = 15;
        let wait_max = 30;
        if ( current_url.indexOf( 'direct.yandex' ) )
        {
          wait_max = 45;
        }

        if ( this.captchaSearch == 'yandex' && action_selector != yandex.checkboxCaptchaSelector )
        {
          if ( await yandex.checkCaptcha() === 'stop' )
          {
            return false;
          }
        }
        else if ( this.captchaSearch == 'google' )
        {
          if ( await google.checkCaptcha() === 'stop' )
          {
            return false;
          }
        }

        if ( typeof wait_selector !== 'undefined' )
        {
          let i = 0;

          do
          {
            try
            {
              this._pageContent = await page.evaluate( ( wait_selector ) => {
                if ( document.querySelector( wait_selector ) !== null )
                {
                  let window_stop = true;

                  const non_stop_regexp = new RegExp(
                    //'(direct\.yandex\.ru\/registered\/main\.pl)|(\/showcaptcha\?)',
                    //'(direct\.yandex\.ru\/registered\/main\.pl)|(passport\.yandex\.ru\/(challenge|auth|showcaptcha))|(sso\.passport\.yandex\.ru)|(sso.ya.ru)',
                    '(direct\.yandex\.ru\/registered\/main\.pl)|(passport\.yandex\.ru\/(challenge|auth|showcaptcha))|(sso\.passport\.yandex\.ru)',
                    'g'
                  );


                  if ( non_stop_regexp.test( document.location.href ) )
                  {
                    window_stop = false;
                  }

                  if ( window_stop )
                  {
                    if ( /\/showcaptcha\?/g.test( document.location.href ) )
                    {
                      const $checkbox_captcha = document.querySelector( '.CheckboxCaptcha-Button' );
                      if ( $checkbox_captcha !== null )
                      {
                        return 'wait-captcha-checkbox';
                      }

                      const $slider_captcha = document.querySelector( '.CaptchaSlider' );
                      if ( $slider_captcha !== null )
                      {
                        return 'wait-captcha-slider';
                      }
                    }
                    else if ( /\/yandex\.[^\/]+\/search\/(touch\/)?\?text=/g.test( document.location.href ) )
                    {
                      const $serpitem = document.querySelector( '.serp-item' );
                      if ( $serpitem === null )
                      {
                        return 'wait-results';
                      }
                    }

                    window.stop();
                  }


                  document.readyState = 'complete';
                  return document.documentElement.outerHTML;
                }
                else
                {
                  return null;
                }
              }, wait_selector );


              if ( php.inArray( this._pageContent, [ 'wait-captcha-checkbox', 'wait-captcha-slider', 'wait-results' ] ) )
              {
                if ( this._pageContent == 'wait-results' )
                {
                  await page.waitForTimeout( 1000 );
                }
                if ( this._pageContent == 'wait-captcha-slider' )
                {
                  //await page.waitForTimeout( 2000 );
                }
                else
                {
                  //await page.waitForTimeout( 500 );
                }

                this._pageContent = await page.evaluate( () => {
                  window.stop();
                  document.readyState = 'complete';
                  return document.documentElement.outerHTML;
                });
              }
            }
            catch ( error )
            {

            }

            if ( !this._pageContent )
            {
              await page.waitForTimeout( 100 );
              i++;
            }
            else if ( /<\/(span|div|p)>/.test( this._pageContent ) )
            {
/*
              this._pageContent += '';

              if ( !/<\/(span|div|p)>/.test( this._pageContent ) )
              {
                await page.waitForTimeout( 500 );
              }
*/
              break;
            }
          }
          while ( this._pageContent === null && i <= wait_max );


          if ( this._pageContent )
          {
            this._pageContent += '';
            return true;
          }
          else
          {
            return false;
          }
        }
        else
        {
          await page.waitForTimeout( 1000 );

          if ( !/<\/(span|div|p)>/.test( await page.content() ) )
          {
            await page.waitForTimeout( 1000 );
          }

          if ( !/<\/(span|div|p)>/.test( await page.content() ) )
          {
            await page.waitForTimeout( 500 );
          }

          return true;
        }
      }
    }

    let current_url = await page.url().replace( /%20/g, '+' );
    if ( current_url == cached_url )
    {
      return false;
    }
  }



  async finishPageLoading( wait_selector )
  {
    let i = 0;

    do
    {
      try
      {
        this._pageContent = await page.evaluate( ( wait_selector ) => {
          if ( document.querySelector( wait_selector ) !== null )
          {
            let window_stop = true;

            const non_stop_regexp = new RegExp(
              //'(direct\.yandex\.ru\/registered\/main\.pl)|(\/showcaptcha\?)',
              //'(direct\.yandex\.ru\/registered\/main\.pl)|(passport\.yandex\.ru\/(challenge|auth|showcaptcha))|(sso\.passport\.yandex\.ru)|(sso.ya.ru)',
              '(direct\.yandex\.ru\/registered\/main\.pl)|(passport\.yandex\.ru\/(challenge|auth|showcaptcha))|(sso\.passport\.yandex\.ru)',
              'g'
            );


            if ( non_stop_regexp.test( document.location.href ) )
            {
              window_stop = false;
            }

            if ( window_stop )
            {
              if ( /\/showcaptcha\?/g.test( document.location.href ) )
              {
                const $checkbox_captcha = document.querySelector( '.CheckboxCaptcha-Button' );
                if ( $checkbox_captcha !== null )
                {
                  return 'wait-captcha-checkbox';
                }

                const $slider_captcha = document.querySelector( '.CaptchaSlider' );
                if ( $slider_captcha !== null )
                {
                  return 'wait-captcha-slider';
                }
              }
              else if ( /\/yandex\.[^\/]+\/search\/(touch\/)?\?text=/g.test( document.location.href ) )
              {
                const $serpitem = document.querySelector( '.serp-item' );
                if ( $serpitem === null )
                {
                  return 'wait-results';
                }
              }

              window.stop();
            }


            document.readyState = 'complete';
            return document.documentElement.outerHTML;
          }
          else
          {
            return null;
          }
        }, wait_selector );


        if ( php.inArray( this._pageContent, [ 'wait-captcha-checkbox', 'wait-captcha-slider', 'wait-results' ] ) )
        {
          if ( this._pageContent == 'wait-results' )
          {
            await page.waitForTimeout( 1000 );
          }
          if ( this._pageContent == 'wait-captcha-slider' )
          {
            //await page.waitForTimeout( 2000 );
          }
          else
          {
            //await page.waitForTimeout( 500 );
          }

          this._pageContent = await page.evaluate( () => {
            window.stop();
            document.readyState = 'complete';
            return document.documentElement.outerHTML;
          });
        }
      }
      catch ( error )
      {

      }

      if ( !this._pageContent )
      {
        await page.waitForTimeout( 100 );
        i++;
      }
      else
      {
        break;
      }
    }
    while ( this._pageContent === null && i <= 20 );

    this._pageContent += '';
  }



  pageContent()
  {
    if ( !this._pageContent )
    {
      this._pageContent = page.content();
    }

    return this._pageContent + '';
  }



  /**
   * Заполнение текстовых полей
   */
  async fillTextInput( selector, text, delay )
  {
    if ( typeof delay == 'undefined' )
    {
      delay = 10;
    }

    const $input = await page.$( selector );

    if ( $input !== null )
    {
      const v = await page.evaluate( ( selector ) => {
        return document.querySelector( selector ).value;
      }, selector );

      const readonly =  await page.evaluate( ( selector ) => {
        const $el = document.querySelector( selector );

        if ( $el.outerHTML.indexOf( 'readonly' ) > -1 )
        {
          return true;
        }
        else
        {
          return false;
        }
      }, selector );


      if ( v == text || readonly )
      {
        return true;
      }

      await page.focus( selector );
      await page.hover( selector );
      await page.click( selector );

      await page.waitForTimeout( delay );

      const symbols = text.split( '' );
      for ( let i in symbols )
      {
        await $input.press( symbols[ i ] );
        await page.waitForTimeout( delay );
      }

      return true;
    }
    else
    {
      if ( selector.indexOf( 'passwd' ) < 0 )
      {
        console.log( 'Текстовое поле "' + selector + '" не найдено' );
      }

      return false;
    }
  }


  /**
   * Клик по координатам
   */
  async mouseClick( selector, delay )
  {
    const $click_object = await page.$( selector );

    if ( $click_object !== null )
    {
      const button_offset = await $click_object.boundingBox();

      const x = button_offset[ 'x' ] + Math.round( button_offset[ 'width' ] / 2 );
      const y = button_offset[ 'y' ] + Math.round( button_offset[ 'height' ] / 2 );

      await page.focus( selector );
      await page.hover( selector );
      await page.mouse.click( x, y );

      if ( typeof delay != 'undefined' )
      {
        await page.waitForTimeout( delay );
      }

      return true;
    }
    else
    {
      console.log( 'Не найден объект "' + selector + '" для клика' );
      return false;
    }
  }



  /**
   * Обработка ошибок работы с браузером
   */
  async errorProcessing( error )
  {
    error = error.toString();

    console.log( '//////////////////////////////////////////' );
    console.log( _post.handler );

/*
if ( typeof yandex.screen != 'undefined' && yandex.screen )
{
  fs.writeFileSync( rootPath + '/_errors/yandex.png',  await page.screenshot() );
}
*/

    if ( await page )
    {
      console.log( await page.url() );
      //console.log( await page.content() );
    }

    //console.log( _post );
    //console.log( browser );
    console.log( error );
    console.log( '//////////////////////////////////////////' );

/*
if ( error.indexOf( 'Error: Evaluation failed: TypeError: Cannot read properties of null (reading \'action\')' ) > -1 )
{
  fs.writeFileSync( rootPath + '/_errors/direct.html', await page.content() );
}
*/

/*
if ( await page.url() == 'https://direct.yandex.ru/registered/main.pl?cmd=advancedForecast' )
{
  fs.writeFileSync( rootPath + '/_errors/direct.html', await page.content() );
}
*/

    if ( error.indexOf( 'connect ECONNREFUSED' ) > -1 && php.trim( seoaOptions[ 'captcha_solving' ][ 'services' ][ 'capmonster' ][ 'domain' ] )
          && error.indexOf( seoaOptions[ 'captcha_solving' ][ 'services' ][ 'capmonster' ][ 'domain' ] ) > -1 )
    {
      fs.writeFileSync( rootPath + '/tmp/' + serverName + '/control/capmonster-stop', '1' );
    }


    if ( error.indexOf('Failed to navigate:') > -1 )
    {
      captchaNumbers = {
        authorization: 1,
        parsing: 1
      };
      console.log('/******************* captcha numbers start *******************/');
      console.log( JSON.stringify( captchaNumbers ) );
      console.log('/******************** captcha numbers end ********************/');
    }


    if ( promisePool )
    {
      promisePool.end( this.dbErrorPorcessing );
    }

    if ( browser )
    {
      browser.close();
    }

    process.exit();;
  }



  /**
   * Обработка ошибок закрытия соединения с mysql
   */
  dbErrorPorcessing( error )
  {
    console.log( error );
  }
}

module.exports = seoadmin;
