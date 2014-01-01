$(document).ready(function() {
    /*
     * Add a page controller
     *
     * */
    var page_controller_functions = {
        'init': function(list_el) {
            var page_controller_state = {};
            var self = page_controller_state;
            self.list_el = list_el;

            self.list_height = $(list_el).height();
            self.row_height = $('div.row', list_el).first().height();
            self.rows_per_viewing = self.list_height / self.row_height;

            self.num_els_in_list = $('div.row', list_el).count();
            self.num_pages = self.num_els_in_list / self.rows_per_viewing;
        },
        'render': function() {
            /* create a <ol>
            *               <li></li>
                        </ol>*/
        },
    }
    $('.list').each(function(ind, this_list) {
    });

}
