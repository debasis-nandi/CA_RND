import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';

declare var $: any;

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['main-layout.component.css']
})
export class MainLayoutComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.loadScript();
  }

  ngOnDestroy() {
  }

  loadScript(){
    $('#framework').multiselect({
      nonSelectedText: 'Select Template',
      enableFiltering: true,
      enableCaseInsensitiveFiltering: true,
      buttonWidth:'88%'
     });

     $('#Userselect').multiselect({
      nonSelectedText: 'Select User',
      enableFiltering: true,
      enableCaseInsensitiveFiltering: true,
      buttonWidth:'100%'
     });

    $(".filter_icon").click(function () {
      $(".filter_panel").toggle();
    });

    $(".tab_panell_close").click(function () {
      $(".filter_panel").hide();
    });

    $('.datepicker').datepicker({
      format: 'dd MM yyyy',
      orientation: 'left bottom',
      autoclose: true,
      todayHighlight: true
    });

    $("[data-toggle=popover]").popover({
			html: true, 
			content: function() {
          	return $('#popover-content').html();
        	}
    });
    
    $("#pop2").click(function(){
      $(".toggleMe1").slideToggle(300);
    });			
    
    $(document).mouseup(function (e) {
      var container = $(".toggleMe1");//YOUR CONTAINER SELECTOR
      // if the target of the click isn't the container nor a descendant of the container
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.hide();
      }
    }); 

    $('#back-to-top').click(function () {
      $('#back-to-top').tooltip('hide');
      $('body,html').animate({
        scrollTop: 0
      }, 1000);
      return false;
    });

    $(".filter_icon2").click(function(){
      $(".country_filter").toggle();
    });
    
    $(".tab_panell_close").click(function(){
     $(".country_filter").hide();
    });

  }

}