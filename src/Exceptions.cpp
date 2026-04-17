#include "Exceptions.h"

InventoryException::InventoryException(const std::string& message) : std::runtime_error(message) {}

OutOfStockException::OutOfStockException(const std::string& message) : InventoryException(message) {}

InvalidPriceException::InvalidPriceException(const std::string& message) : InventoryException(message) {}

InvalidQuantityException::InvalidQuantityException(const std::string& message) : InventoryException(message) {}

ProductNotFoundException::ProductNotFoundException(const std::string& message) : InventoryException(message) {}

UnauthorizedAccessException::UnauthorizedAccessException(const std::string& message)
    : InventoryException(message) {}
