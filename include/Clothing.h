#ifndef CLOTHING_H
#define CLOTHING_H

#include "Product.h"

class Clothing : public Product {
private:
    std::string size;

public:
    Clothing(int id, const std::string& name, double price, int quantity, const std::string& size);

    const std::string& getSize() const;
    void setSize(const std::string& size);

    std::string getCategory() const override;
    std::string getExtraAttribute() const override;
    void displayDetails() const override;
    void print(std::ostream& out) const override;
};

#endif
