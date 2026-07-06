"use client";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@frontend/components/ui/breadcrumb";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import React from "react";

const NavigationBreadcrumbs = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const params = useParams<{
    organizationId: string;
    customerId?: string;
    checkoutId?: string;
    paymentLinkId?: string;
  }>();
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* <BreadcrumbItem>
          <BreadcrumbLink asChild className="">
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem> */}
        {/* {segments.length > 1 && <BreadcrumbSeparator />} */}
        {segments.map((segment, index) =>
          segment === params.checkoutId ||
          segment === params.paymentLinkId ||
          segment === params.customerId ||
          segment === params.organizationId ? (
            segments.length > 1 &&
            index + 1 != segments.length && (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </React.Fragment>
            )
          ) : (
            <React.Fragment key={index}>
              {index + 1 != segments.length && (
                <BreadcrumbItem>
                  <BreadcrumbLink asChild className="">
                    <Link href={`/${segments.slice(0, index + 1).join("/")}`}>
                      {segment
                        .split("-")
                        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                        .join(" ")}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              )}
              {index + 1 == segments.length && (
                <BreadcrumbItem>
                  <BreadcrumbPage className="">
                    {segment
                      .split("-")
                      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                      .join(" ")}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              )}
              {index + 1 != segments.length && segments.length > 1 && (
                <BreadcrumbSeparator />
              )}
            </React.Fragment>
          ),
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default NavigationBreadcrumbs;
