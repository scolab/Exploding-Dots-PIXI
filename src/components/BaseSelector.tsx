import React, { Component } from 'react';
import styled from 'styled-components';
import { IUSAGE_MODE, USAGE_MODE } from '../Constants';

export interface IBaseSelectorProps {
  changeBase: (index: number) => any;
  base: Array<number | string>;
  allBase: any[];
  usage_mode: IUSAGE_MODE;
}

export interface IBaseSelectorState {
  menuOpened: boolean;
}

interface IFakeButton {
  numChar: number;
}

interface IMenuProps {
  opened: boolean;
  itemCount: number;
}

export default class BaseSelector extends Component<IBaseSelectorProps, IBaseSelectorState> {

  public constructor(props: IBaseSelectorProps) {
    super(props);
    this.state = {
      menuOpened: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.showMenu = this.showMenu.bind(this);
  }

  public render(): JSX.Element {
    const {
      base,
      allBase,
      usage_mode,
    } = this.props;
    const img = require('./images/left_arrow.png');
    if (allBase.length > 1 && usage_mode !== USAGE_MODE.EXERCISE) {
      const menuItems: any = allBase.map((value, index) => {
        if (value !== base) {
          return (
            <MenuButton
              key={index}
              type="button"
              onClick={() => this.handleChange(index)}
            >
              {value[0]}
              <ArrowImg
                src={img}
                role="presentation"
              />
              {value[1]}
            </MenuButton>
          );
        }
      },
      );
      const index = menuItems.indexOf(undefined);
      if (index !== -1) menuItems.splice(index, 1);
      const menu: JSX.Element =
        (
          <Menu
            opened={this.state.menuOpened}
            itemCount={menuItems.length}
          >
          {menuItems}
        </Menu>
        );
      return (
        <MenuHolder>
          <GradientBackgroundButton
            type="button"
            onClick={this.showMenu}
            // onClick={onClick}
          >
            {base[0]}
            <ArrowImg
              src={img}
              role="presentation"
            />
            {base[1]}
            {this.state.menuOpened ? '▴' : '▾' }
          </GradientBackgroundButton>
          {menu}
        </MenuHolder>
      );
    } else { // tslint:disable-line no-else-after-return
      return (
        <GradientBackgroundDiv
          numChar={base[0].toString().length + base[1].toString().length + 1}
        >
          {base[0]}
          <ArrowImg
            src={img}
            role="presentation"
          />
          {base[1]}
        </GradientBackgroundDiv>
      );
    }
  }

  private showMenu(e): void{
    e.preventDefault();
    if (this.state.menuOpened) {
      document.removeEventListener('click', this.showMenu);
      this.setState({ menuOpened: false });
    } else {
      document.addEventListener('click', this.showMenu);
      this.setState({ menuOpened: true });
    }
  }

  private handleChange(value: number): void {
    this.props.changeBase(value);
  }
}

const MenuHolder = styled.div`
  display: inline-block;
`;

const GradientBackgroundButton = styled.button`
  margin: 2px;
  background: #FCFCFC;
  border-radius: 25px;
  font-family: Nunito;
  font-size: 24px;
  width: 120px;
  height: 40px;
  vertical-align: middle;
  text-align: center;
  border: none;
  cursor: pointer;
  margin-left: 20px;
  color: #48209c;
  &:hover { box-shadow: 0 0 0 1px #48209c; }
  &:active { box-shadow: 0 0 0 0; }
  &:focus { outline:0; };
`;

const MenuButton = styled(GradientBackgroundButton)`
  border-radius: 0;
  margin: 0;
  &:hover { background: lightgrey; box-shadow: none; }
  &:active { background: #FCFCFC; box-shadow: none; }
`;

const GradientBackgroundDiv = styled.div`
  margin: 2px;
  background: #FCFCFC;
  border-radius: 25px;
  font-family: Nunito;
  font-size: 24px;
  width: ${(props: IFakeButton) => (props.numChar >= 4 ? '110px;' : '100px;')};
  height: 40px;
  vertical-align: middle;
  text-align: center;
  border: none;
  margin-left: 20px;
  color: #48209c;
  display: inline-block;
  padding-top: 5px;
`;

const Menu = styled.div`
  background: #FCFCFC;
  bottom: 48px;
  display: flex;
  flex-direction: column-reverse;
  height: ${(props: IMenuProps) => props.opened ? props.itemCount * 40: '0'}px;
  margin-left: 20px;
  overflow: hidden;
  position: absolute;
  transition: height 0.2s linear;
  border-radius: 25px;
  ${MenuButton} {
    opacity: ${(props: IMenuProps) => props.opened ? 1 : 0};
    transition: opacity 0.1s linear;
    transition-delay: ${(props: IMenuProps) => props.opened ? '0.1s' : 0};
  }
`;

const ArrowImg = styled.img`
  margin: 0px 5px;
  width: 27px;
  height: auto;
`;
