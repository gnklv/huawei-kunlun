var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

var components = path.join(__dirname, '..', 'public/less/components/components.less');



function getComponentLocation (file) {
	var letter = file[0];
	var dir = false;
	var result = {};

	switch(letter) {
		case 'c': 
		  dir = 'components'
			break
		case 'm': 
		  dir = 'mixins'
			break
		case 'h': 
		  dir = 'helpers'
			break
	}

	if (dir) {
		var endpoint = path.join(__dirname, '..', 'public/less/', dir, dir + '.less');
		var endpointDir = path.join(__dirname, '..', 'public/less/', dir);
		var lessPath = path.join(__dirname, '..', 'public/less/', dir, file + '.less');

		try {
			var access = fs.accessSync(lessPath);
			if (!access) {
				result = {error: 'Дратути!\n' + lessPath +'\nПохоже, что этот файл уже существует'}
			}
		} catch (err) {
			if(err) {
				if (err.code === 'ENOENT') {
					result = {endpoint, lessPath, endpointDir}
				} else {
					result = {error: 'Что то не так с доступом к файлу\n' + lessPath}
				}
			}
		}
	} else {
		result = {error: 'Неизветсный префикс. Используй доступные c-/m-/h-\nИли пиши руками'}
	}
	return result;
}

/* GET home page. */

router.get('/add_less', (req, res, next) => {

	var fileName = req.query.id.replace(/\s+/g, ''),
			result = getComponentLocation(fileName),
			content = '';
			component = '';

	if (!result.error) {
		content = '.' + fileName + ' {\n\n}';
		component = '\n@import \'' + fileName + '\';';
		fs.writeFile(result.lessPath, content, (err) => {
		  if (err) {
		  	throw err;
		  } else {
		  	fs.appendFile(result.endpoint, component, 'utf8', (err) => {
  				if(err) {
  					throw err;
  				}	
  			});
		  }
		});
	} 
  res.send(result);
});


module.exports = router;
