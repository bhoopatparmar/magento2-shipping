<?php

namespace Salecto\Shipping\Controller\Adminhtml\Shipping;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Backend\Model\Session\Quote;
use Magento\Framework\Controller\ResultFactory;

class Save extends Action
{
    /**
     * @var PageFactory
     */
    private $backendQuoteSession;

    /**
     * @param Context $context
     * @param Quote $backendQuoteSession
     */
    public function __construct(
        Context $context,
        Quote $backendQuoteSession
    ) {
        $this->backendQuoteSession = $backendQuoteSession;
        parent::__construct($context);
    }

    public function execute()
    {
        $quote = $this->backendQuoteSession->getQuote();
        $quote->setWexoShippingData(json_encode($this->getRequest()->getPost('wexo_shipping_data')))->save();
        $response['success'] = false;
        $resultJson = $this->resultFactory->create(ResultFactory::TYPE_JSON);
        $resultJson->setData($response);
        return $resultJson;
    }
}
