import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        required:
          "text-foreground after:content-['*'] after:ml-0.5 after:text-destructive",
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Label = React.forwardRef(
  ({ className, variant, size, required, ...props }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        labelVariants({ variant: required ? "required" : variant, size }),
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
);

Label.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(["default", "muted", "required"]),
  size: PropTypes.oneOf(["default", "sm", "lg"]),
  required: PropTypes.bool,
  children: PropTypes.node,
  htmlFor: PropTypes.string,
};

Label.displayName = LabelPrimitive.Root.displayName;

export { Label, labelVariants };
