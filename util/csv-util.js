module.exports = new CsvUtil()

	function _removeWhiteSpace(str){
		return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
	}

function CsvUtil(){
	return {
		getArrayFromCsv: function(csvString){
			return csvString.split(',').map(_removeWhiteSpace)
		}
	}
}