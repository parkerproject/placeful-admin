(function($) {
  'use strict';
	//Setting Configuration
	$('#tweecool').tweecool({
		//settings
        show_actions: true,
		 username : 'envato', 
		 limit : 1,
		 profile_image : false,
        action_reply_icon: '<i class="fa fa-reply"></i>',
        action_retweet_icon: '<i class="fa fa-retweet"></i>',
        action_favorite_icon: '<i class="fa fa-star"></i>',
		show_time : false,
		show_media : false,
		show_media_size: 'thumb'  //values: small, large, thumb, medium 
	});
})(jQuery);