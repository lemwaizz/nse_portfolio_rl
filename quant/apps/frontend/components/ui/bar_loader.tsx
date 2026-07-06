"use client";
import React from "react";
import { BarLoader, CircleLoader, MoonLoader } from "react-spinners";

interface BarLoaderFullScreenWidthPRops {
  loading: boolean;
}

export const BarLoaderFullScreenWidth: React.FC<
  BarLoaderFullScreenWidthPRops
> = ({ loading }) => {
  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 z-50 w-full h-1">
          <BarLoader
            color="#662d91"
            className="z-50 w-full h-full"
            width="100%"
          />
        </div>
      )}
    </>
  );
};

export const CircleProgressIndicator: React.FC<
  BarLoaderFullScreenWidthPRops
> = ({ loading }) => {
  return (
    <>
      {loading && (
        <div className="">
          <MoonLoader
            color="#6468f0"
            className="z-50 w-full h-full"
            size={25}
          />
        </div>
      )}
    </>
  );
};
