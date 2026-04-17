#include "Electronics.h"

#include "Exceptions.h"

#include <iostream>

Electronics::Electronics(int id, const std::string& name, double price, int quantity, int warrantyMonths)
    : Product(id, name, price, quantity), warrantyMonths(0) {
    setWarrantyMonths(warrantyMonths);
}

int Electronics::getWarrantyMonths() const {
    return warrantyMonths;
}

void Electronics::setWarrantyMonths(int updatedWarrantyMonths) {
    if (updatedWarrantyMonths < 0) {
        throw InvalidQuantityException("Warranty months cannot be negative.");
    }
    warrantyMonths = updatedWarrantyMonths;
}

std::string Electronics::getCategory() const {
    return "Electronics";
}

std::string Electronics::getExtraAttribute() const {
    return std::to_string(warrantyMonths);
}

void Electronics::displayDetails() const {
    std::cout << *this << '\n';
}

void Electronics::print(std::ostream& out) const {
    Product::print(out);
    out << " | Warranty: " << warrantyMonths << " months";
}
