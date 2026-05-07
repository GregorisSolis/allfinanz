import React from 'react';

export const useNavigate = () => jest.fn();

export const Link = ({ to, children, ...props }: any) => (
  <a href={to} {...props}>{children}</a>
);

export const BrowserRouter = ({ children }: any) => children;