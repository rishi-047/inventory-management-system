#ifndef ELECTRONICS_H
#define ELECTRONICS_H

#include "Product.h"

class Electronics : public Product {
private:
    // Encapsulation in the derived class.
    int warrantyMonths;

public:
    Electronics(int id, const std::string& name, double price, int quantity, int warrantyMonths);

    int getWarrantyMonths() const;
    void setWarrantyMonths(int warrantyMonths);

    // Inheritance + Polymorphism: overriding abstract behavior from Product.
    std::string getCategory() const override;
    std::string getExtraAttribute() const override;
    void displayDetails() const override;
    void print(std::ostream& out) const override;
};

#endif
