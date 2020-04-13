import Jimp from 'jimp';
import SimpleDate from 'simple-datejs';
import fs from 'fs';
import {getAuthorization, writeToSheet} from './AppendData.js';

const DIRECTORY = './images/';
const locations = ['madrid_infanta', 'madrid_subiza', 'segovia'];

// START HELPER METHODS

// Creates a matrix, then generates dates from the 01/02/2020 to the 31/09/2020
// and puts them on the first column of the matrix.

const generateDates = () => {

	var values = [];
	
	values.push(["date"]);
	
	// Initial and end date 01/02/2020 and 31/09/2020
	// Month starts at 0 == Jan in this function
	// Change to year 2020
	var initialDate = new SimpleDate({year: 2020, month: 1, date: 1});
	var finalDate = new SimpleDate({year: 2020, month: 9, date: 1});

	var diff = initialDate.getDaysDifference(finalDate);

	for (var i = 1; i <= diff; i++) {

		values[values.length - 1].push(initialDate.toString('dd/MM/yyyy'));
		initialDate.addDays(1);

	}

	return values;
}

// Depth search first algorithm that edits the adjacent white pixels.

const markNeighbours = (x, y, image) => {

	if (x < image.bitmap.width && y < image.bitmap.height && x >= 0 && y >= 0) {
		
		var idx = image.getPixelIndex(x, y);

		if (image.bitmap.data[idx + 3] !== 0 && image.getPixelColor(x, y) === 4294967295) {

			image.setPixelColor(255, x, y);

			markNeighbours(x + 1, y + 1, image);
			markNeighbours(x, y + 1, image);
			markNeighbours(x - 1, y + 1, image);
			markNeighbours(x - 1, y, image);
			markNeighbours(x - 1, y - 1, image);
			markNeighbours(x, y - 1, image);
			markNeighbours(x + 1, y - 1, image);
			markNeighbours(x + 1, y, image);

		}
	}
}

// Gets all the names of the files in the directory

const getDirectoryFiles = async (location) => {
	
	var imageNames = [];
	const {err, files} = await readDirectory(location);
	if (err) throw err;
	for (var index in files) { imageNames.push(files[index]); }
	return imageNames;

}

// Reads directory

const readDirectory = (location) => {
  	return new Promise(resolve => {
    	fs.readdir( DIRECTORY + location, (err,files) => resolve({ err, files }));
  	});
}

// Extracts data points from image

const extractPoints = (image) => {
	
	var points = [];
	var bottom = 0;
	var top = image.bitmap.height;

	for (var x = 0; x < image.bitmap.width; x++) {
		for (var y = 0; y < image.bitmap.height; y++) {
			var idx = image.getPixelIndex(x, y);
			if (image.bitmap.data[idx + 3] !== 0 && image.getPixelColor(x, y) === 4294967295) {
				if (y > bottom) bottom = y;
				if (y < top) top = y;

				points.push({x: x, y: y});
				markNeighbours(x, y, image);
			}

		}
	}

	return { points, bottom, top };
}

// Splits file name by points

const splitFileName = (imageName) => {

	var data = imageName.split('.');
			
	return {
		alergenName: data[0],
		maxCount: parseInt(data[1]),
		minCount: parseInt(data[2]),
	};
}

// Converts the height of the pixel into grams of pollen per cubed meter

const interpolateData= (points, bottom, top, maxCount, minCount, values) => {

	var normalizingConst = Math.abs(top - bottom);

	for (var i = 0; i < points.length; i++) {
		// Check to see if there is a date with no info and fill.
		if (i !== 0 && points[i].x - points[i - 1].x > 6) {	
			values[values.length - 1].push("-");
		} 

		var value = Math.round((bottom - points[i].y) * maxCount / normalizingConst + minCount);
		values[values.length - 1].push(value);
	}
}


const extractPollenInfo = async (location, imageNames, values) => {

	for (const imageName of imageNames) {

		let { err, image } = await readImage(location, imageName);
		
		if (err) console.log(err);

		const { points, bottom, top } = extractPoints(image);
			
		const { alergenName, maxCount, minCount } = splitFileName(imageName);

		values.push([alergenName]);

		interpolateData(points, bottom, top, maxCount, minCount, values);

	}
}

// Opens image and creates a Jimp image.

const readImage = (location, imageName) => {
  	return new Promise(resolve => {
  		Jimp.read(DIRECTORY + location + '/' + imageName, (err, image) => resolve({ err, image }));
  	});
}

// END HELPER METHODS

const scanImages = async (location) => {
	
	let values = generateDates();	
	let imageNames = await getDirectoryFiles(location);
	await extractPollenInfo(location, imageNames, values);
	return values;		
}


const scanScript = async () => {
	
	// Get authorization token to be able to write to spreadsheet.

	var jwtClient = await getAuthorization();

	// For every location (folder) scan each image and get data,
	// then save to google sheets.

	locations.forEach( async (location) => {
		let values = await scanImages(location);
		writeToSheet(values, location + '!A1:Y1', jwtClient);
	});

}

scanScript();

/*

const testScript = async () => {

	let imageName = "cupresaceas.245.0.png";
	
	let values = [];	

	let { err, image } = await readImage(locations[0], imageName);
		
	if (err) console.log(err);

	const { points, bottom, top } = extractPoints(image);



	const { alergenName, maxCount, minCount } = splitFileName(imageName);

	values.push([alergenName]);

	interpolateData(points, bottom, top, maxCount, minCount, values);
	
	var logger = {
		bottom: bottom,
		top: top,
		maxCount: maxCount,
		minCount: minCount,
		normalizingConst: bottom - top,
	}
	console.log(logger)

	console.log(points);

	console.log(values);

}

testScript();
*/






