function plsLoginMe(){
	var inp = $("#txtField");
	var pass = $("#passField");
	if ((inp.val().length > 0) && (pass.val().length > 0)) {
		window.event.returnValue = false;
		document.location.href='preonboarding_dashboard.html'
	}	
	if(navigator.userAgent.match(/Trident\/7\./)) {
	if (window.event) //this option for Internet Explorer
	 { 
	 window.event.returnValue = false;
	 window.event.cancelBubble = true;
	 } 
	else if (e) //this option for other browsers
	 {
	 e.stopPropagation();
	 e.preventDefault();
	 }
	}
}
$(document).ready(function() 
{

	$('#numberOfDays').hide()
	$('#Frequency').change(function(){
        var i= $('#Frequency').val();
		if(i=="Custom"){$('#numberOfDays').show()}
        else{$('#numberOfDays').hide()}
	})
	if($("#duplicacyThresh").length)
	{
		$("#duplicacyThresh").slider({tooltip:'always'});
	}
	if($("#titleBoost").length)
	{
		$("#titleBoost").slider({tooltip:'always'});
	}
	var filternum=1
	$('#pasitiveFltrRow1 u').text('Filter '+filternum);
	
	$('#addMoreFilterBtn').click(function(){
		var $div = $('div[id^="pasitiveFltrRow"]:last');
		var num = parseInt( $div.prop("id").match(/\d+/g), 10 ) +1;
		var $cloneMe = $div.clone().prop('id', 'pasitiveFltrRow'+num );
        $cloneMe.find('u').text('Filter '+num);	
        $div.after($cloneMe)
	})

	
	
    
    
    
})

// Textarea placeholder multiline text function
function placeholderMultilineFn(type) {
var textAreas = document.getElementsByTagName(type);
	Array.prototype.forEach.call(textAreas, function(elem) {
		elem.placeholder = elem.placeholder.replace(/\\n/g, '\n');
	});
}
placeholderMultilineFn('textarea');
