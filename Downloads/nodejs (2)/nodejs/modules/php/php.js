/**
 * Эквиваленты PHP Функций
 *
 * @package SerpHunt
 * @subpackage Core
 */

class php
{
  static hexDecode( str )
  {
    return str.replace( /\\x([0-9a-f]{2})/ig, function( _, pair ) {
        return String.fromCharCode( parseInt( pair, 16 ) );
    });
  }


  static decodeHtmlSpecialChars( str )
  {
    const map =
    {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'"
    };

    return str.replace( /&amp;|&lt;|&gt;|&quot;|&#039;/g, function( m ) { return map[ m ]; } );
  }


  /**
   * Задержка в миллисекундах
   *
   * @param string service Сервис: yandex или google. Опционально
   */
  static sleep( ms )
  {
    return new Promise( resolve => setTimeout( resolve, ms ) );
  }

  /**
   * Удаление пробелов из начала и конца строки
   *
   * @param string str Строка
   *
   * @return string
   */
  static trim( str )
  {
    if ( str == undefined )
    {
      return null;
    }
    else if ( str === false || str === null )
    {
      return str;
    }
    else if ( typeof str == 'object' || Array.isArray( str ) )
    {
      return str;
    }
    else
    {
      str += '';
      str = str.replace(/^\s*|\s*$/g, '');

      if ( str == '0' )
      {
        return '';
      }

      return str;
    }
  }


  /**
   * Экранирование символов в регулярных выражениях
   *
   * @param string str Строка
   * @param string delimiter Дополнительные символы для экранирования
   *
   * @return string
   */
  static pregQuote( str, delimiter )
  {
    return (str + '')
            .replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
  }


  /**
   * Проверка присутствия значения в массиве
   *
   * @param mixed needle Искомое значение
   * @param array haystack Массив
   * @param boolean strict Опционально. При значении TRUE дополнительно проверяет совпадение типов
   *
   * @return boolean
   */
  static inArray( needle, haystack, strict )
  {
  	var found = false, key, strict = !!strict;

  	for ( key in haystack )
    {
  		if ( ( strict && haystack[key] === needle ) || ( !strict && haystack[key] == needle ) )
      {
  			found = true;
  			break;
  		}
  	}

  	return found;
  }


  /**
   * Дополняет строку другой строкой до заданной длины
   *
   * @param string input Входная строка
   * @param string padLength Длина дополнения
   * @param string padString Добавляемая строка
   * @param string padType Опционально. Сторона с которой происходит добавление: STR_PAD_RIGHT, STR_PAD_LEFT или STR_PAD_BOTH
   *
   * @return string
   */
  static strPad( input, padLength, padString, padType )
  {
    var half = ''
    var padToGo = 0;

    var _strPadRepeater = function (s, len)
    {
      var collect = '';
      while ( collect.length < len )
      {
        collect += s;
      }

      collect = collect.substr(0, len);
      return collect;
    }

    input += '';
    padString = padString !== undefined ? padString : ' ';

    if (padType !== 'STR_PAD_LEFT' && padType !== 'STR_PAD_RIGHT' && padType !== 'STR_PAD_BOTH')
    {
      padType = 'STR_PAD_RIGHT';
    }

    if ( ( padToGo = padLength - input.length ) > 0 )
    {
      if (padType === 'STR_PAD_LEFT')
      {
        input = _strPadRepeater(padString, padToGo) + input;
      }
      else if (padType === 'STR_PAD_RIGHT')
      {
        input = input + _strPadRepeater( padString, padToGo );
      }
      else if (padType === 'STR_PAD_BOTH')
      {
        half = _strPadRepeater( padString, Math.ceil( padToGo / 2 ) );
        input = half + input + half;
        input = input.substr( 0, padLength );
      }
    }
    return input;
  }


  /**
   * Сериализация данных в строку
   *
   * @param object/array v Данные
   * @param object options Опциаонально. Настройки
   *
   * @return string
   */
  static serialize( v, options )
  {
    if (!options) {
        options = {
            metakey: '__phpSerializedObject__',
        };
    }
    var ret = '';
    if (v === null) {
        ret = 'N;';
    } else if (typeof v === 'boolean') {
        ret = 'b:' + (v ? '1' : '0') + ';';
    } else if (typeof v === 'number' || (typeof v === 'string' && "" + (+v) === v)) {
        if (v % 1 === 0) {
            ret = 'i:' + v + ';';
        } else if (isNaN(v)) {
            ret = 'd:NAN;';
        } else {
            ret = 'd:' + v.toFixed(16) + ';';
        }
    } else if (typeof v === "string") {
        ret = "s:" + Buffer.byteLength(v, 'utf8') + ':"' + v + '";';
    } else if (v[options.metakey]) {
        var meta = v[options.metakey];
        var properties = Object.keys(v).filter(k => { return k !== options.metakey; }).map(k => {
            var key = k;
            if (meta.access && meta.access[k] && meta.access[k] === "protected") {
                key = "\0*\0" + k;
            }
            else if (meta.access && meta.access[k] && meta.access[k] === "private") {
                key = "\0" + meta.name + "\0" + k;
            }
            return this.serialize(key) + this.serialize(v[k]);
        });
        ret = 'O:' + meta.name.length + ':"' + meta.name + '":' + properties.length + ':{' + properties.join('') + '}';
    } else if (typeof v === 'object') {
        var properties = Object.keys(v).map(k => {
            return this.serialize(k, options) + this.serialize(v[k], options);
        });
        ret = 'a:' + properties.length + ':{' + properties.join('') + '}';
    }
    return ret;
  }


  /**
   * Восстанавливает данные из сериализованной строки
   *
   * @param string data Сериализованная строка
   *
   * @return object
   */
  static unserialize ( data )
  {
    var that = this,
      utf8Overhead = function (chr) {
        var code = chr.charCodeAt(0);
        if (code < 0x0080) {
          return 0;
        }
        if (code < 0x0800) {
          return 1;
        }
        return 2;
      },
      error = function (type, msg, filename, line) {
        throw msg;
      },
      read_until = function (data, offset, stopchr) {
        var i = 2, buf = [], chr = data.slice(offset, offset + 1);

        while (chr != stopchr) {
          if ((i + offset) > data.length) {
            error('Error', 'Invalid');
          }
          buf.push(chr);
          chr = data.slice(offset + (i - 1), offset + i);
          i += 1;
        }
        return [buf.length, buf.join('')];
      },
      read_chrs = function (data, offset, length) {
        var i, chr, buf;

        buf = [];
        for (i = 0; i < length; i++) {
          chr = data.slice(offset + (i - 1), offset + i);
          buf.push(chr);
          length -= utf8Overhead(chr);
        }
        return [buf.length, buf.join('')];
      },
      _unserialize = function (data, offset) {
        var dtype, dataoffset, keyandchrs, keys,
          readdata, readData, ccount, stringlength,
          i, key, kprops, kchrs, vprops, vchrs, value,
          chrs = 0,
          typeconvert = function (x) {
            return x;
          };

        if (!offset) {
          offset = 0;
        }
        dtype = (data.slice(offset, offset + 1)).toLowerCase();

        dataoffset = offset + 2;

        switch (dtype) {
          case 'i':
            typeconvert = function (x) {
              return parseInt(x, 10);
            };
            readData = read_until(data, dataoffset, ';');
            chrs = readData[0];
            readdata = readData[1];
            dataoffset += chrs + 1;
            break;
          case 'b':
            typeconvert = function (x) {
              return parseInt(x, 10) !== 0;
            };
            readData = read_until(data, dataoffset, ';');
            chrs = readData[0];
            readdata = readData[1];
            dataoffset += chrs + 1;
            break;
          case 'd':
            typeconvert = function (x) {
              return parseFloat(x);
            };
            readData = read_until(data, dataoffset, ';');
            chrs = readData[0];
            readdata = readData[1];
            dataoffset += chrs + 1;
            break;
          case 'n':
            readdata = null;
            break;
          case 's':
            ccount = read_until(data, dataoffset, ':');
            chrs = ccount[0];
            stringlength = ccount[1];
            dataoffset += chrs + 2;

            readData = read_chrs(data, dataoffset + 1, parseInt(stringlength, 10));
            chrs = readData[0];
            readdata = readData[1];
            dataoffset += chrs + 2;
            if (chrs != parseInt(stringlength, 10) && chrs != readdata.length) {
              error('SyntaxError', 'String length mismatch');
            }
            break;
          case 'a':
            readdata = {};

            keyandchrs = read_until(data, dataoffset, ':');
            chrs = keyandchrs[0];
            keys = keyandchrs[1];
            dataoffset += chrs + 2;

            for (i = 0; i < parseInt(keys, 10); i++) {
              kprops = _unserialize(data, dataoffset);
              kchrs = kprops[1];
              key = kprops[2];
              dataoffset += kchrs;

              vprops = _unserialize(data, dataoffset);
              vchrs = vprops[1];
              value = vprops[2];
              dataoffset += vchrs;

              readdata[key] = value;
            }

            dataoffset += 1;
            break;
          default:
            error('SyntaxError', 'Unknown / Unhandled data type(s): ' + dtype);
            break;
        }
        return [dtype, dataoffset - offset, typeconvert(readdata)];
      }
    ;

    return _unserialize((data + ''), 0)[2];
  }
}

module.exports = php;
