import React from "react";
import AppNavbar from "./AppNavbar";
import { Outlet } from "react-router-dom";

const AppLayout: React.FC = () => {
  return (
    <>
      <div>
        <div
          className="main-content"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <AppNavbar />
          <div
            className="content-container px-4"
            style={{ flex: 1, overflowY: "auto" }}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default AppLayout;
