#ifndef EXCEPTIONS_H
#define EXCEPTIONS_H

#include <stdexcept>
#include <string>

class InventoryException : public std::runtime_error {
public:
    explicit InventoryException(const std::string& message);
};

class OutOfStockException : public InventoryException {
public:
    explicit OutOfStockException(const std::string& message);
};

class InvalidPriceException : public InventoryException {
public:
    explicit InvalidPriceException(const std::string& message);
};

class InvalidQuantityException : public InventoryException {
public:
    explicit InvalidQuantityException(const std::string& message);
};

class ProductNotFoundException : public InventoryException {
public:
    explicit ProductNotFoundException(const std::string& message);
};

class UnauthorizedAccessException : public InventoryException {
public:
    explicit UnauthorizedAccessException(const std::string& message);
};

#endif
