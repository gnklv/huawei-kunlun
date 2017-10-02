'use strict'
const fs = require('fs');
const path = require('path');
const config = require('../config.json');


function getAssetPath (p, dist = '') {
	let result = "";

	if(filters.export) {
		if(config.dpe) {
			result = `@File(${p})`
		} else {
			result = `${config.buildStatic}${dist + p}${getRevisionHash()}` 
		}
	} else{
		result = `${config.devStatic}${dist + p}${getRevisionHash()}`
	}
	return result;
}  

function getRevisionHash ()  {
	return config.assetsHash ? `?rev=${filters.hash}` : ''
}


const filters = {
	export: false,
	hash: 1,
	loop: (arr, count) => {
		let result = [];
		let counter  = 0;

		function pushItem (idx) {
		  result.push(arr[counter]);

		  if (idx < count -1) {
		    counter = arr[counter+1] ? counter+1 : 0;
		    pushItem (++idx);
		  }
		}
		pushItem (0)
		return result
	},

	asset: path => getAssetPath(path),
	img_asset: path => getAssetPath(path, 'images/'),
	video_asset: path => getAssetPath(path, 'video/'),
	uploads: path => getAssetPath(path, 'uploads/'),
	js_asset: path => getAssetPath(path, 'javascripts/'),
	css_asset: path => getAssetPath(path, 'stylesheets/'),
	cdn: path => {
		return filters.export ? 
			`${config.storage}/${path}`: `${config.devStatic}storage/${path}` 
	}
}

module.exports = filters;