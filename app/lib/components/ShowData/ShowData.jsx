'use strict';
require('./ShowData.scss');

var data = require('../../../assets/datas/data.json');

var ShowData = React.createClass({
  render: function() {
    return (
      <div className="show-data">
        {data.toString()}
      </div>
    );
  }
});

module.exports = ShowData;
