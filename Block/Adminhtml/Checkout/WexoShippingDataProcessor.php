<?php

namespace Salecto\Shipping\Block\Adminhtml\Checkout;

use Magento\Backend\Model\Session\Quote;
use Magento\Framework\Serialize\Serializer\Json;
use Magento\Quote\Api\Data\ShippingMethodExtensionFactory;
use Magento\Quote\Api\Data\ShippingMethodInterface;
use Magento\Shipping\Model\Config;
use Salecto\Shipping\Block\Adminhtml\Checkout\LayoutProcessorInterface;

class WexoShippingDataProcessor implements LayoutProcessorInterface
{
    const SHIPPING_ADDITIONAL = 'components/wexoShippingAdditionalData/children/shipmondo-parcelshop';

    /**
     * @var Session
     */
    private $backendQuoteSession;

    /**
     * @var Json
     */
    private $jsonSerializer;

    /**
     * Shipping method data factory.
     *
     * @var ShippingMethodInterface
     */
    protected $shippingMethodDataFactory;
    
    /**
     * @var ShippingMethodExtensionFactory
     */
    private $shippingMethodExtensionFactory;

    /**
     * @var Config
     */
    private $shippingConfig;

    /**
     * @param Quote $backendQuoteSession
     * @param Json $jsonSerializer
     * @param Config $shippingConfig
     * @param ShippingMethodExtensionFactory $shippingMethodExtensionFactory
     * @param ShippingMethodInterface $shippingMethodDataFactory
     */
    public function __construct(
        Quote $backendQuoteSession,
        Json $jsonSerializer,
        Config $shippingConfig,
        ShippingMethodExtensionFactory $shippingMethodExtensionFactory,
        ShippingMethodInterface $shippingMethodDataFactory
    ) {
        $this->backendQuoteSession = $backendQuoteSession;
        $this->jsonSerializer = $jsonSerializer;
        $this->shippingMethodDataFactory = $shippingMethodDataFactory;
        $this->shippingMethodExtensionFactory = $shippingMethodExtensionFactory;
        $this->shippingConfig = $shippingConfig;
    }

    /**
     * Process js Layout of block
     *
     * @param array $jsLayout
     * @return array
     */
    public function process($jsLayout)
    {
        $quote = $this->backendQuoteSession->getQuote();
        if ($quote) {
            $shippingAddress = $quote->getShippingAddress();
            $shippingMethod = $shippingAddress->getShippingMethod();
            $rateModel = $shippingAddress->getShippingRateByCode($shippingMethod);
            if ($rateModel) {
                $carriers = $this->shippingConfig->getAllCarriers();
                $errorMessage = $rateModel->getErrorMessage();
                $this->shippingMethodDataFactory
                    ->setCarrierCode($rateModel->getCarrier())
                    ->setMethodCode($rateModel->getMethod())
                    ->setCarrierTitle($rateModel->getCarrierTitle())
                    ->setMethodTitle($rateModel->getMethodTitle())
                    ->setBaseAmount($rateModel->getPrice())
                    ->setAvailable(empty($errorMessage))
                    ->setErrorMessage(empty($errorMessage) ? false : $errorMessage);

                if (!$this->shippingMethodDataFactory->getExtensionAttributes()) {
                    $this->shippingMethodDataFactory->setExtensionAttributes($this->shippingMethodExtensionFactory->create());
                }
                if (isset($carriers[$rateModel->getCarrier()])) {
                    $carrier = $carriers[$rateModel->getCarrier()];
                    if (method_exists($carrier, 'convertAdditionalRateData')) {
                        $carrier->convertAdditionalRateData(
                            $this->shippingMethodDataFactory,
                            $rateModel
                        );
                    }
                }
                $jsLayout['components']['checkoutProvider']['shipping_method']['carrier_code'] = $rateModel->getCarrier();
                $jsLayout['components']['checkoutProvider']['shipping_method']['method_code'] = $rateModel->getMethod();
                if ($this->shippingMethodDataFactory->getExtensionAttributes()) {
                    $jsLayout['components']['checkoutProvider']['shipping_method']['extension_attributes']['wexo_shipping_method_type_handler'] = $this->shippingMethodDataFactory->getExtensionAttributes()->getWexoShippingMethodTypeHandler();
                    $jsLayout['components']['checkoutProvider']['shipping_method']['extension_attributes']['wexo_shipping_method_type'] = $this->shippingMethodDataFactory->getExtensionAttributes()->getWexoShippingMethodType();
                }
            }
            $jsLayout['components']['checkoutProvider']['shippingAddress']['data'] = $quote->getShippingAddress()->getData();
        }
        if (!isset($jsLayout['components']['checkoutProvider']['wexoShippingData'])) {
            $wexoShippingData = $this->backendQuoteSession->getQuote()->getData('wexo_shipping_data');
            if ($wexoShippingData) {
                $jsLayout['components']['checkoutProvider']['wexoShippingData'] = $this->jsonSerializer->unserialize(
                    $this->backendQuoteSession->getQuote()->getData('wexo_shipping_data')
                );
            }
        }
        return $jsLayout;
    }
}
