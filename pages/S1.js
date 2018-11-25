// Import the `Value` model.
import { Editor } from 'slate-react';
import { Value } from 'slate';
const initialValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            leaves: [
              {
                text: 'A line of text in a paragraph.',
              },
            ],
          },
        ],
      },
    ],
  },
})
export default class App extends React.Component {
  state = {
    value: initialValue,
  }
  componentWillReceiveProps(nextProps) {
    console.log("componentWillReceiveProps");
    //console.log(nextProps)
    // if(!this.props.showModal && nextProps.showModal){
    //   this.onShow(nextProps.index);
    // }
    // else if(this.props.showModal && !nextProps.showModal)
    // {
    //   this.onHide();
    // }
    let newValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            leaves: [
              {
                text: nextProps.value,
              },
            ],
          },
        ],
      },
    ],
  },
});
    console.log(newValue);
    this.setState({value:newValue});
  }
  onChange = ({ value }) => {
    this.setState({ value })
  }
 render() {

    return <Editor style={{border:"solid 1px",backgroundColor:"#aaa"}} value={this.state.value} onChange={this.onChange} />
  }
}
