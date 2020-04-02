import Jimp from 'jimp';

Jimp.read('../Pictures/images/madrid_subiza/olea.png')

  .then(image => {
	var points = [];
	for (var x = 0; x < image.bitmap.width; x++) {
		for (var y = 0; y < image.bitmap.height; y++) {
			var idx = image.getPixelIndex(x, y);
			if (image.bitmap.data[idx + 3] !== 0 && image.getPixelColor(x, y) === 4294967295) {
				points.push({x: x, y: y});
				markNeighbours(x, y, image);
			}

		}
	}

  	var file = 'new_name.' + image.getExtension();
    image.write(file);
    console.log(points);
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
