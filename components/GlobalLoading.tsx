import React from "react";
import Spinner from "./ui/Spinner";

interface GlobalLoadingProps {
  message?: string;
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({ message = "Loading..." }) => (
  <Spinner fullScreen label={message} size="xl" />
);

export default GlobalLoading;
