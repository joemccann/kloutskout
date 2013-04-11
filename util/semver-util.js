var fs = require('fs')
	, semver = require('semver')

module.exports = new SemverUtil()

function SemverUtil(){

	var _pkgjson
		,	_incType

	function _incrementVersion(){ return semver.inc( _pkgjson.version, _incType ) }

	function _readPackageJson(path, incType){
		_pkgjson = require(path)
		_incType = incType
	}

	function _writePackageJson(path){
		
		var writeStream = fs.createWriteStream(path)

		_pkgjson.version = _incrementVersion()

		writeStream.write( JSON.stringify(_pkgjson) )

		writeStream.end()
	}

	return {
		incrementVersion: function(path, incType, cb){
			_readPackageJson(path, incType)
			_writePackageJson(path)
			cb && typeof cb === 'function' && cb()
		}
	}
}