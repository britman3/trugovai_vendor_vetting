'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, TextArea, Select } from '@/components/ui';
import { ProductCategory, PricingModel, ProductFormData } from '@/types';

export default function NewVendorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    description: '',
    contactName: '',
    contactEmail: ''
  });

  const [products, setProducts] = useState<ProductFormData[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState<ProductFormData>({
    name: '',
    description: '',
    category: ProductCategory.Chatbot,
    pricingModel: PricingModel.Subscription
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          products
        })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to create vendor');
        return;
      }

      router.push(`/vendors/${data.data.id}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.description) {
      return;
    }
    setProducts([...products, newProduct]);
    setNewProduct({
      name: '',
      description: '',
      category: ProductCategory.Chatbot,
      pricingModel: PricingModel.Subscription
    });
    setShowProductForm(false);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-teal hover:underline text-sm mb-2 inline-block">
          ← Back to Vendor Registry
        </Link>
        <h1 className="text-3xl font-bold text-navy">Add New Vendor</h1>
        <p className="text-slate700 mt-1">Create a vendor record before starting an assessment</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Vendor Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., OpenAI, Anthropic"
              required
            />

            <Input
              label="Website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
              required
            />

            <TextArea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of what this vendor offers"
              required
            />
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Information (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Contact Name"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              placeholder="e.g., John Smith"
            />

            <Input
              label="Contact Email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="contact@vendor.com"
            />
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Products</CardTitle>
            {!showProductForm && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowProductForm(true)}
              >
                Add Product
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {products.length > 0 && (
              <div className="space-y-3 mb-4">
                {products.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-ice rounded-[var(--radius)]"
                  >
                    <div>
                      <p className="font-medium text-navy">{product.name}</p>
                      <p className="text-sm text-slate700">
                        {product.category} • {product.pricingModel}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduct(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {showProductForm && (
              <div className="p-4 border border-slate700/20 rounded-[var(--radius)] space-y-4">
                <Input
                  label="Product Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g., ChatGPT Enterprise"
                />

                <TextArea
                  label="Product Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Brief description of this product"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Category"
                    options={Object.values(ProductCategory).map(cat => ({
                      value: cat,
                      label: cat
                    }))}
                    value={newProduct.category}
                    onChange={(value) => setNewProduct({ ...newProduct, category: value as ProductCategory })}
                  />

                  <Select
                    label="Pricing Model"
                    options={Object.values(PricingModel).map(model => ({
                      value: model,
                      label: model
                    }))}
                    value={newProduct.pricingModel}
                    onChange={(value) => setNewProduct({ ...newProduct, pricingModel: value as PricingModel })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" onClick={addProduct}>
                    Add Product
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowProductForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {products.length === 0 && !showProductForm && (
              <p className="text-slate700/70 text-center py-4">
                No products added yet. Products can also be added later.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-rejected/10 border border-rejected/20 rounded-[var(--radius)] text-rejected">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            Create Vendor
          </Button>
          <Link href="/">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
