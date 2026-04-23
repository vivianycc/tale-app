import React from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { Home, Heart, TrendingUp, User } from "react-feather";
import Logo from "../assets/logotype.svg";

const StyledNav = styled.nav`
  margin: 0 32px;
  position: fixed;
  bottom: 32px;
  left: 0;
  right: 0;
  ul {
    border-radius: 32px;
    display: flex;
    height: 64px;
    background-color: var(--neutral-200);
    padding: 8px;
  }
  li {
    width: 100%;
    height: 100%;
    list-style-type: none;
  }
  li:first-of-type {
    display: none;
  }
  a {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    border-radius: 1000px;
    color: var(--neutral-700);
    text-decoration: none;
    white-space: nowrap;
  }
  a:hover {
    background-color: var(--neutral-300);
  }
  a.active {
    background-color: var(--neutral-700);
    color: white;
  }

  @media only screen and (min-width: 625px) {
    min-width: 25%;
    height: 100%;
    margin: 0;

    position: relative;
    bottom: 0;
    ul {
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      height: 100%;
      /* margin-left: 8%; */
      background-color: transparent;
      li {
        height: auto;
        width: auto;
        padding: 8px 16px;
      }
      li:first-of-type {
        display: flex;
        padding-left: 36px;
        margin-bottom: 36px;
        img {
          height: 100%;
          width: auto;
        }
      }
      a {
        width: auto;
        padding: 16px 24px;
        justify-content: flex-start;
      }

      a::after {
        content: attr(label);
        margin-left: 8px;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
`;

export default function Nav() {
  return (
    <StyledNav className="nav">
      <ul>
        <li>
          <img src={Logo} alt="" />
        </li>
        <li>
          <NavLink to="/" label="每日記錄">
            <Home />
          </NavLink>
        </li>
        <li>
          <NavLink to="/foods" label="食物目錄">
            <Heart />
          </NavLink>
        </li>
        <li>
          <NavLink to="/stats" label="統計數據">
            <TrendingUp />
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" label="個人設定">
            <User />
          </NavLink>
        </li>
      </ul>
    </StyledNav>
  );
}
