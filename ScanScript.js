import Jimp from 'jimp';
import SimpleDate from 'simple-datejs';

const generateDates = () => {
	var values = [];
	
	values.push(["date"]);
	
	// Initial and end date 01/02/2020 and 31/09/2020
	// Month starts at 0 == Jan in this function
	// Change to year 2020
	var initialDate = new SimpleDate({year: 2019, month: 1, date: 1});
	var finalDate = new SimpleDate({year: 2019, month: 9, date: 1});

	var diff = initialDate.getDaysDifference(finalDate);

	console.log(diff);

	for (var i = 1; i <= diff; i++) {

		values[values.length - 1].push(initialDate.toString('dd/MM/yyyy'));
		initialDate.addDays(1);

	}
	
	return values;
}


let values = generateDates();

Jimp.read('../Pictures/images/madrid_subiza/cupresaceas.png')

  .then(image => {
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

	values.push(["olea"]);

	var maxCount = 872;
	var minCount = 0;

	var normalizingConst = Math.abs(top - bottom);

	for (var i = 0; i < points.length; i++) {
		// Check to see if there is a date with no info and fill.
		if (i !== 0 && points[i].x - points[i - 1].x > 6) {	
			values[values.length - 1].push("-");
		} 

		var value = Math.round((bottom - points[i].y) * maxCount / normalizingConst + minCount);
		values[values.length - 1].push(value);

	}

	

  	var file = 'new_name.' + image.getExtension();
    image.write(file);
    console.log('Top: ' + top + ', Bottom: ' + bottom);
    

    console.log(values);
    //console.log(values[1][127]);

  })
  .catch(err => {
    console.log(err);
  });


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


