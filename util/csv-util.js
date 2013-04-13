module.exports = new CsvUtil()

	function _removeWhiteSpace(str){
		return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
	}

	function _removeQuotes(str){
		return str.replace(/"|'/g, '')
	}

	function _sanitize(str){
		return _removeWhiteSpace( _removeQuotes (str) )
	}

function CsvUtil(){
	return {
		// Return a sanitized array of strings
		getArrayFromCsv: function(csvString){
			return csvString.split(',').map(_sanitize)
		}
	}
}