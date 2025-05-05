// {
//           Tooltip,
//           TextFill: MyColorPicker,
//         }

/*

NOTE: 
To do that you need pass a component with a name in format TypeName, 
where type refer to type of element. For example TextFill. 
You can use all built-element types as Text, Image, svg. 
But you can also use Many prefix when several elements are selected. 
And you can define your own new components for any element type.

*/
import { StoreType } from 'polotno/model/store';
import { Tooltip } from 'polotno/canvas/tooltip';
import { Popover, Menu, MenuItem, Divider, Button, ButtonGroup } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';

export const DropDown = observer(({ store, element, elements }: { store: StoreType, element: any, elements: any[] }) => {
  // store - main polotno store object
  // elements - array of selected elements. The same as store.selectedElements
  // element - first selected element. The same as store.selectedElements[0]
  return (

       <ButtonGroup>
<Popover
                content={
                  <Menu>
                    <MenuItem
                      icon="arrow-up"
                      text="Insert Above"
                      onClick={() => {}}
                    />
                    <MenuItem
                      icon="arrow-down"
                      text="Insert Below"
                      onClick={() => {}}
                    />
                    <Divider />
                    <MenuItem
                      icon="trash"
                      text="Delete Row"
                      intent="danger"
                      onClick={() => {}}
                      disabled={element.rows <= 1}
                    />
                  </Menu>
                }
                position="bottom"
                minimal
              >
                <Button icon="more" minimal />
              </Popover>
       </ButtonGroup>
  );
});


//Use Prefix 'Table' for table related components otherwise it won't work

export const ToolTipConfig = {
  Tooltip,
  TableDropdown: DropDown,
}
