import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  Skeleton,
  ProductCardSkeleton,
  ShopPageSkeleton,
  ProductDetailSkeleton,
  ProductImageGallerySkeleton,
  ProductInfoSkeleton,
} from "@/components/skeleton";

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: function (props) {
      return React.createElement("div", props);
    },
    h1: function (props) {
      return React.createElement("h1", props);
    },
    p: function (props) {
      return React.createElement("p", props);
    },
  },
  AnimatePresence: function ({ children }) {
    return children;
  },
}));

describe("Skeleton Components", () => {
  describe("Skeleton", () => {
    it("renders with default props", () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute("aria-label", "Loading...");
    });

    it("renders with custom dimensions", () => {
      render(<Skeleton width={200} height={100} />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveStyle({ width: "200px", height: "100px" });
    });

    it("renders circular variant", () => {
      render(<Skeleton variant="circular" />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveClass("rounded-full");
    });

    it("renders text variant with multiple lines", () => {
      render(<Skeleton variant="text" lines={3} />);
      const skeletons = screen.getAllByRole("status");
      expect(skeletons).toHaveLength(3);
    });

    it("applies shimmer animation by default", () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole("status");
      const shimmerElement = skeleton.querySelector(".animate-shimmer");
      expect(shimmerElement).toBeInTheDocument();
    });

    it("applies pulse animation when specified", () => {
      render(<Skeleton animation="pulse" />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveClass("animate-pulse");
    });
  });

  describe("ProductCardSkeleton", () => {
    it("renders grid view by default", () => {
      render(<ProductCardSkeleton />);
      const container = screen.getByRole("status").closest(".group");
      expect(container).toHaveClass("bg-white", "rounded-xl", "border");
    });

    it("renders list view when specified", () => {
      render(<ProductCardSkeleton viewMode="list" />);
      const container = screen.getByRole("status").closest(".bg-white");
      expect(container).toHaveClass("rounded-xl", "border");
      // Check for flex layout in list view
      const flexContainer = container?.querySelector(".flex.gap-6");
      expect(flexContainer).toBeInTheDocument();
    });

    it("contains multiple skeleton elements", () => {
      render(<ProductCardSkeleton />);
      const skeletons = screen.getAllByRole("status");
      expect(skeletons.length).toBeGreaterThan(5); // Image, title, description, price, buttons
    });
  });

  describe("ProductImageGallerySkeleton", () => {
    it("renders main image skeleton", () => {
      render(<ProductImageGallerySkeleton />);
      const skeletons = screen.getAllByRole("status");
      expect(skeletons.length).toBeGreaterThan(4); // Main image + thumbnails + controls
    });

    it("renders thumbnail skeletons", () => {
      render(<ProductImageGallerySkeleton />);
      const container = screen.getByRole("status").closest(".space-y-4");
      const thumbnailContainer = container?.querySelector(".flex.gap-2");
      expect(thumbnailContainer).toBeInTheDocument();
    });
  });

  describe("ProductInfoSkeleton", () => {
    it("renders product info skeleton elements", () => {
      render(<ProductInfoSkeleton />);
      const skeletons = screen.getAllByRole("status");
      expect(skeletons.length).toBeGreaterThan(10); // Title, price, description, variants, buttons, etc.
    });

    it("contains variant selector skeletons", () => {
      render(<ProductInfoSkeleton />);
      const container = screen.getByRole("status").closest(".space-y-6");
      const variantGrid = container?.querySelector(".grid.grid-cols-2");
      expect(variantGrid).toBeInTheDocument();
    });
  });

  describe("ShopPageSkeleton", () => {
    it("renders with default props", () => {
      render(<ShopPageSkeleton />);
      const skeletons = screen.getAllByRole("status");
      expect(skeletons.length).toBeGreaterThan(20); // Hero, filters, products, pagination
    });

    it("renders correct number of product skeletons", () => {
      const productsPerPage = 6;
      render(<ShopPageSkeleton productsPerPage={productsPerPage} />);

      // Find the products grid container
      const container = document.querySelector(".grid.grid-cols-1.gap-6");
      expect(container).toBeInTheDocument();

      // Count product card skeletons (each has multiple skeleton elements)
      const productContainers = container?.querySelectorAll(".group.bg-white");
      expect(productContainers).toHaveLength(productsPerPage);
    });

    it("renders list view when specified", () => {
      render(<ShopPageSkeleton viewMode="list" />);
      const container = document.querySelector(".space-y-6");
      expect(container).toBeInTheDocument();
    });
  });

  describe("ProductDetailSkeleton", () => {
    it("renders complete product detail skeleton", () => {
      render(<ProductDetailSkeleton />);
      const skeletons = screen.getAllByRole("status");
      expect(skeletons.length).toBeGreaterThan(30); // All sections combined
    });

    it("contains breadcrumb skeleton", () => {
      render(<ProductDetailSkeleton />);
      const container = document.querySelector(".container");
      const breadcrumbContainer = container?.querySelector(".mb-6 .flex.items-center");
      expect(breadcrumbContainer).toBeInTheDocument();
    });

    it("contains related products section", () => {
      render(<ProductDetailSkeleton />);
      const relatedSection = document.querySelector(".mt-16");
      expect(relatedSection).toBeInTheDocument();

      const relatedGrid = relatedSection?.querySelector(".grid.grid-cols-1.gap-6");
      expect(relatedGrid).toBeInTheDocument();
    });
  });
});
