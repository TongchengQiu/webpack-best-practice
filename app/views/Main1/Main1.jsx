'use strict';
require('./Main1.html');
require('./Main1.scss');

let Header = require('../../lib/components/Header/Header.jsx');
let ShowData = require('../../lib/components/ShowData/ShowData.jsx');

var Main1 = React.createClass({
  render: function() {
    return (
      <div className="main">
        <Header />
        <ShowData />
      </div>
    );
  }
});

ReactDOM.render(
  <Main1 />,
  document.getElementById('wrap')
);
