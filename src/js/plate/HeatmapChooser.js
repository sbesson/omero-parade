import React from 'react';
import { getHeatmapColor } from '../util';

var HeatmapChooser = React.createClass({

    getInitialState: function() {
        return {heatmapNames: undefined};
    },

    componentDidMount: function() {
        var plateId = this.props.plateId;

        // Load OMERO.tables data for this plate (if any)
        var url = "/webgateway/table/Plate/" + plateId + "/query/?query=*";
        $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                if (this.isMounted()) {
                    console.log("table", data);
                    // if we have table data for this plate...
                    if (data.data && data.data.columns) {
                        // TODO: find which column is the Well ID
                        var wellColIdx = 0;
                        // want to get data in map of {wellId:[values]}
                        var heatmapData = data.data.rows.reduce(function(prev, curr){
                            var wellId = curr[wellColIdx] + "";
                            prev[wellId] = curr;
                            return prev;
                        }, {});

                        // This component needs the names for <select>
                        this.setState({
                            heatmapNames: data.data.columns,
                        });

                        // But we pass the data up to Plate for use by Wells etc.
                        this.props.setHeatmap({
                            heatmapData: heatmapData
                        });
                    }
                }
            }.bind(this)
        });
    },


    handleHeatmapSelect: function(event) {
        var heatmapIndex = event.target.value;

        if (heatmapIndex == "--") {
            this.props.setHeatmap({
                selectedHeatmap: undefined,
            });
        }
        // Pass this back to parent Plate, so Wells can render it
        this.props.setHeatmap({
            selectedHeatmap: heatmapIndex,
        });
    },

    render: function() {
        var heatmapChooser,
            lutKey,
            options;
        if (!this.state.heatmapNames) {
            return (
                <span></span>
            )
        }
        if (this.props.heatmapRange) {
            lutKey = (
                <div className="heatmapLutKey">
                    <div title={this.props.heatmapRange[0] + "-" + this.props.heatmapRange[1]}>
                        {[...Array(125)].map(function(x, i){
                            var c = getHeatmapColor(i/125);
                            return (
                                <div key={i} style={{'backgroundColor': c}}></div>
                            )
                        }.bind(this))}
                    </div>
                </div>
            )
        }

        return (
            <div style={{'float':"left"}}>
            <select onChange={this.handleHeatmapSelect} style={{'float':"left"}}>
                <option
                    value="--" >
                    Choose heatmap....
                </option>
                {this.state.heatmapNames.map(function(n, i){
                    return (
                        <option
                            key={i}
                            value={i}>
                            {n}
                        </option>
                    );
                })}
            </select>
                {lutKey}
            </div>
        );
    }
});

export default HeatmapChooser;

