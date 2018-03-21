function checkState() {
	$('#p0').css('opacity', 0);
	$('#p1').css('opacity', 0);
	$('#p2').css('opacity', 0);
	$('#p3').css('opacity', 0);
	var states = [
		['migraine', 'migraines'],
		['temperature', 'brulant', 'brulante', 'fièvre', 'fievre', 'chaleur', 'chaud'],
		['froid', 'glaciale', 'glacial', 'gelée', 'gel', 'gelee', 'hypothermie'],
		['vomissements', 'vomir', 'nausée', 'nausee', 'nausees', 'remontées', 'remontees']
	];

	var input = (($('#result-field').val()).trim()).split(' ');

	for (var word = 0; word < input.length; word++) {
		for (var match = 0; match < states.length; match++)
			if (states[match].indexOf(input[word]) > -1) {
				$('#p'+match).css('opacity', 100);
			}
	}
}