const translateError = (error) => {
  const fallback = {
    status: 500,
    message: "An unexpected error occurred",
  };

  if (!error) return fallback;

  if (error.name === "ValidationError") {
    const firstKey = Object.keys(error.errors || {})[0];
    if (firstKey) {
      return {
        status: 400,
        message: error.errors[firstKey].message || "Validation failed",
      };
    }
    return {
      status: 400,
      message: "Validation failed",
    };
  }

  if (error.code === 11000 || error.codeName === "DuplicateKey") {
    const duplicateField = Object.keys(error.keyValue || {})[0];
    let message = "Duplicate value already exists.";

    if (duplicateField) {
      switch (duplicateField) {
        case "name":
          message = "Category name already exists";
          break;
        case "sku":
          message = "SKU already exists";
          break;
        case "barcode":
          message = "Barcode already exists";
          break;
        default:
          message = `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already exists`;
      }
    } else if (error.message) {
      if (error.message.includes("barcode_1")) {
        message = "Barcode already exists";
      } else if (error.message.includes("sku_1")) {
        message = "SKU already exists";
      } else if (error.message.includes("name_1")) {
        message = "Name already exists";
      }
    }

    return {
      status: 400,
      message,
    };
  }

  if (error.name === "CastError") {
    return {
      status: 400,
      message: `Invalid ${error.path}: ${error.value}`,
    };
  }

  if (error.statusCode && error.message) {
    return {
      status: error.statusCode,
      message: error.message,
    };
  }

  return {
    status: 500,
    message: error.message || fallback.message,
  };
};

module.exports = {
  translateError,
};
