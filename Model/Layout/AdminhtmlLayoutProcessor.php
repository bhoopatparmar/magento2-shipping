<?php

namespace Salecto\Shipping\Model\Layout;

class AdminhtmlLayoutProcessor implements \Salecto\Shipping\Block\Adminhtml\Checkout\LayoutProcessorInterface
{
    const SHIPPING_ADDITIONAL = 'components/wexoShippingAdditionalData';

    /**
     * @var array
     */
    private $processors;

    /**
     * @var string
     */
    private $path;

    /**
     * @var \Magento\Framework\Stdlib\ArrayManager
     */
    private $arrayManager;

    /**
     * @var string
     */
    private $setPath;

    /**
     * @param \Magento\Framework\Stdlib\ArrayManager $arrayManager
     * @param array $processors
     * @param string $path
     * @param string $setPath
     */
    public function __construct(
        \Magento\Framework\Stdlib\ArrayManager $arrayManager,
        $processors = [],
        $path = self::SHIPPING_ADDITIONAL,
        $setPath = self::SHIPPING_ADDITIONAL
    ) {
        $this->processors = $processors;
        $this->path = $path;
        $this->arrayManager = $arrayManager;
        $this->setPath = $setPath;
    }

    /**
     * @param array $jsLayout
     * @return array
     */
    public function process($jsLayout)
    {
        $additionalData = $this->arrayManager->get($this->path, $jsLayout);
        foreach ($this->processors as $processor) {
            $additionalData = $processor->process($additionalData);
        }
        return $this->arrayManager->set($this->setPath, $jsLayout, $additionalData);
    }
}
